import {
  StatsCard,
  StatsCardHeader,
  StatsEmpty,
  StatsStat,
} from "@/components/stats/stats-card";
import { RelativeTime } from "@/components/stats/relative-time";
import { getGithubStats } from "@/lib/stats/github";
import { formatNumber } from "@/lib/stats/utils";

export async function GithubCard() {
  const data = await getGithubStats();

  const hasActivity =
    data.contributionsThisYear > 0 ||
    data.contributionsThisWeek > 0 ||
    data.streak > 0 ||
    data.recentCommits.length > 0;

  if (data.source === "unavailable" && !hasActivity) {
    return (
      <StatsCard className="sm:col-span-2" href={data.profileUrl}>
        <StatsCardHeader label="GitHub" href={data.profileUrl} />
        <StatsEmpty message="GitHub activity is unavailable right now." />
      </StatsCard>
    );
  }

  return (
    <StatsCard className="sm:col-span-2">
      <StatsCardHeader label="GitHub" href={data.profileUrl} />

      <div className="flex flex-wrap gap-8 sm:gap-10">
        <StatsStat
          value={formatNumber(data.contributionsThisYear)}
          label="Contributions this year"
        />
        <StatsStat
          value={formatNumber(data.contributionsThisWeek)}
          label="Contributions this week"
        />
        <StatsStat value={data.streak} label="Day streak" />
      </div>

      {data.recentCommits.length > 0 ? (
        <ul className="mt-6 space-y-3 border-t border-border pt-5">
          {data.recentCommits.map((c) => (
            <li key={`${c.url}-${c.date}`}>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <p className="truncate text-sm text-foreground group-hover:text-accent">
                  {c.message}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-muted">
                  {c.repo}
                  <span className="text-border"> · </span>
                  <RelativeTime date={c.date} />
                </p>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </StatsCard>
  );
}
