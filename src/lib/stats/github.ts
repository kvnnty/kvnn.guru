import { statsConfig } from "@/data/stats";
import type { GithubCommit, GithubStatsData } from "./types";
import { safeJson } from "./utils";

const GITHUB_API = "https://api.github.com";

function headers(): HeadersInit {
  const h: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "kvnn-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

interface GhEvent {
  type: string;
  repo: { name: string };
  created_at: string;
  payload?: {
    commits?: { message: string; sha: string }[];
  };
}

interface ContributionDay {
  contributionCount: number;
  date: string;
}

function emptyGithub(username: string): GithubStatsData {
  return {
    source: "unavailable",
    username,
    profileUrl: `https://github.com/${username}`,
    streak: 0,
    contributionsThisWeek: 0,
    contributionsThisYear: 0,
    recentCommits: [],
  };
}

function weekStartISO(): string {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  return weekAgo.toISOString().slice(0, 10);
}

function summarizeCalendar(days: ContributionDay[]): {
  streak: number;
  thisWeek: number;
  thisYear: number;
} {
  if (!days.length) return { streak: 0, thisWeek: 0, thisYear: 0 };

  const todayStr = new Date().toISOString().slice(0, 10);
  const weekStart = weekStartISO();
  const thisWeek = days
    .filter((d) => d.date >= weekStart)
    .reduce((sum, d) => sum + d.contributionCount, 0);
  const thisYear = days.reduce((sum, d) => sum + d.contributionCount, 0);

  let streak = 0;
  const sorted = [...days].sort((a, b) => b.date.localeCompare(a.date));
  let started = false;
  for (const day of sorted) {
    if (!started) {
      if (day.date === todayStr && day.contributionCount === 0) continue;
      started = true;
    }
    if (day.contributionCount > 0) streak += 1;
    else break;
  }

  return { streak, thisWeek, thisYear };
}

/** Fallback when GraphQL calendar isn't available (no token) */
function estimateFromEvents(events: GhEvent[]): {
  streak: number;
  thisWeek: number;
} {
  const weekStart = weekStartISO();
  const pushDays = new Set<string>();
  let thisWeek = 0;

  for (const event of events) {
    if (event.type !== "PushEvent") continue;
    const day = event.created_at.slice(0, 10);
    const count = event.payload?.commits?.length ?? 1;
    pushDays.add(day);
    if (day >= weekStart) thisWeek += count;
  }

  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 30; i++) {
    const key = cursor.toISOString().slice(0, 10);
    if (i === 0 && !pushDays.has(key)) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    if (pushDays.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }

  return { streak, thisWeek };
}

function recentCommitsFromEvents(events: GhEvent[]): GithubCommit[] {
  const commits: GithubCommit[] = [];

  for (const event of events) {
    if (event.type !== "PushEvent" || !event.payload?.commits) continue;
    for (const c of [...event.payload.commits].reverse()) {
      const repo = event.repo.name.split("/").pop() ?? event.repo.name;
      commits.push({
        message: c.message.split("\n")[0].slice(0, 90),
        repo,
        url: `https://github.com/${event.repo.name}/commit/${c.sha}`,
        date: event.created_at,
      });
      if (commits.length >= 3) return commits;
    }
  }

  return commits;
}

async function fetchContributionCalendar(username: string): Promise<{
  days: ContributionDay[];
  total: number;
}> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { days: [], total: 0 };

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(`${GITHUB_API}/graphql`, {
    method: "POST",
    headers: {
      ...headers(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login: username } }),
    next: { revalidate: statsConfig.cache.github },
  });

  const data = await safeJson<{
    data?: {
      user?: {
        contributionsCollection?: {
          contributionCalendar?: {
            totalContributions: number;
            weeks: { contributionDays: ContributionDay[] }[];
          };
        };
      };
    };
  }>(res);

  const calendar =
    data?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) return { days: [], total: 0 };

  return {
    days: calendar.weeks.flatMap((w) => w.contributionDays),
    total: calendar.totalContributions,
  };
}

export async function getGithubStats(): Promise<GithubStatsData> {
  const username = statsConfig.github.username;

  try {
    const [eventsRes, calendar] = await Promise.all([
      fetch(`${GITHUB_API}/users/${username}/events/public?per_page=40`, {
        headers: headers(),
        next: { revalidate: statsConfig.cache.github },
      }),
      fetchContributionCalendar(username),
    ]);

    const events = (await safeJson<GhEvent[]>(eventsRes)) ?? [];
    const recentCommits = recentCommitsFromEvents(events);

    if (!eventsRes.ok && !calendar.days.length) {
      return emptyGithub(username);
    }

    const fromCalendar = calendar.days.length
      ? summarizeCalendar(calendar.days)
      : null;
    const fromEvents = estimateFromEvents(events);

    return {
      source: "synced",
      username,
      profileUrl: `https://github.com/${username}`,
      streak: fromCalendar?.streak ?? fromEvents.streak,
      contributionsThisWeek: fromCalendar?.thisWeek ?? fromEvents.thisWeek,
      contributionsThisYear: calendar.total || fromCalendar?.thisYear || 0,
      recentCommits,
    };
  } catch (error) {
    console.error("GitHub fetch failed:", error);
    return emptyGithub(username);
  }
}
