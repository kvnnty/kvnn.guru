import { statsConfig, wakatimeFallback } from "@/data/stats";
import type {
  WakaTimeActivityPoint,
  WakaTimeEditor,
  WakaTimeLanguage,
  WakaTimeModel,
  WakaTimeStatsData,
} from "./types";
import { safeJson } from "./utils";

const WAKATIME_API = "https://wakatime.com/api/v1";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

interface WakaTimeNamedStat {
  name: string;
  percent?: number;
  text?: string;
  total_seconds?: number;
}

interface WakaTimeModelBreakdown {
  name: string;
  lines: number;
  cost: number;
}

interface WakaTimeDaySummary {
  grand_total?: {
    total_seconds?: number;
    text?: string;
    ai_additions?: number;
    ai_deletions?: number;
    human_additions?: number;
    human_deletions?: number;
    ai_line_changes_total?: number;
    ai_input_tokens?: number;
    ai_output_tokens?: number;
    ai_prompt_events_total?: number;
    ai_model_breakdown?: WakaTimeModelBreakdown[];
    ai_model_line_changes?: Record<string, number>;
    ai_model_costs?: Record<string, number>;
  };
  languages?: WakaTimeNamedStat[];
  editors?: WakaTimeNamedStat[];
  range?: { date?: string };
}

interface WakaTimeSummariesResponse {
  data?: WakaTimeDaySummary[];
  cumulative_total?: { seconds?: number; text?: string };
  daily_average?: { seconds?: number; text?: string };
}

function authHeader(apiKey: string): string {
  return `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
}

function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours <= 0 && minutes <= 0) return "0 secs";
  if (hours <= 0) return `${minutes} mins`;
  if (minutes <= 0) return hours === 1 ? "1 hr" : `${hours} hrs`;
  return `${hours} hr${hours === 1 ? "" : "s"} ${minutes} mins`;
}

function mapActivity(days: WakaTimeDaySummary[]): WakaTimeActivityPoint[] {
  if (!days.length) return [...wakatimeFallback.activity];

  return days.map((day) => {
    const date = day.range?.date
      ? new Date(`${day.range.date}T12:00:00`)
      : null;
    const label =
      date && !Number.isNaN(date.getTime())
        ? DAY_LABELS[date.getDay()]
        : "?";
    return {
      day: label,
      seconds: Math.round(day.grand_total?.total_seconds ?? 0),
    };
  });
}

function mergeNamedStats(
  days: WakaTimeDaySummary[],
  key: "languages" | "editors",
): { name: string; percent: number; text: string }[] {
  const totals = new Map<string, number>();

  for (const day of days) {
    for (const item of day[key] ?? []) {
      if (!item.name) continue;
      totals.set(
        item.name,
        (totals.get(item.name) ?? 0) + (item.total_seconds ?? 0),
      );
    }
  }

  const sum = [...totals.values()].reduce((a, b) => a + b, 0);
  if (sum <= 0) return [];

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, seconds]) => ({
      name,
      percent: seconds / sum,
      text: formatDuration(seconds),
    }));
}

function mergeModels(days: WakaTimeDaySummary[]): WakaTimeModel | null {
  const byName = new Map<string, { lines: number; cost: number }>();

  for (const day of days) {
    const gt = day.grand_total;
    if (!gt) continue;

    if (gt.ai_model_breakdown?.length) {
      for (const m of gt.ai_model_breakdown) {
        if (!m.name) continue;
        const prev = byName.get(m.name) ?? { lines: 0, cost: 0 };
        byName.set(m.name, {
          lines: prev.lines + (m.lines ?? 0),
          cost: prev.cost + (m.cost ?? 0),
        });
      }
      continue;
    }

    for (const [name, lines] of Object.entries(gt.ai_model_line_changes ?? {})) {
      const prev = byName.get(name) ?? { lines: 0, cost: 0 };
      byName.set(name, {
        lines: prev.lines + lines,
        cost: prev.cost + (gt.ai_model_costs?.[name] ?? 0),
      });
    }
  }

  const ranked = [...byName.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.lines - a.lines);

  return ranked[0] ?? null;
}

function aggregateFromSummaries(
  json: WakaTimeSummariesResponse,
): WakaTimeStatsData {
  const username = statsConfig.wakatime.username;
  const days = json.data ?? [];
  const activity = mapActivity(days);

  let aiLineChanges = 0;
  let humanLineChanges = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  let prompts = 0;

  for (const day of days) {
    const gt = day.grand_total;
    if (!gt) continue;

    aiLineChanges +=
      gt.ai_line_changes_total ??
      (gt.ai_additions ?? 0) + (gt.ai_deletions ?? 0);
    humanLineChanges +=
      (gt.human_additions ?? 0) + (gt.human_deletions ?? 0);
    inputTokens += gt.ai_input_tokens ?? 0;
    outputTokens += gt.ai_output_tokens ?? 0;
    prompts += gt.ai_prompt_events_total ?? 0;
  }

  const totalSeconds =
    json.cumulative_total?.seconds ??
    days.reduce((sum, d) => sum + (d.grand_total?.total_seconds ?? 0), 0);
  const dailyAverageSeconds = json.daily_average?.seconds ?? 0;
  const lineTotal = aiLineChanges + humanLineChanges;
  const aiDrivenPercent =
    lineTotal > 0 ? Math.round((aiLineChanges / lineTotal) * 100) : 0;

  return {
    source: "synced",
    username,
    profileUrl: `https://wakatime.com/@${username}`,
    range: statsConfig.wakatime.range,
    totalSeconds,
    humanReadableTotal:
      json.cumulative_total?.text ?? formatDuration(totalSeconds),
    dailyAverageSeconds,
    humanReadableDailyAverage:
      json.daily_average?.text ?? formatDuration(dailyAverageSeconds),
    aiDrivenPercent,
    aiLineChanges,
    humanLineChanges,
    inputTokens,
    outputTokens,
    prompts,
    topModel: mergeModels(days),
    languages: mergeNamedStats(days, "languages") as WakaTimeLanguage[],
    editors: mergeNamedStats(days, "editors") as WakaTimeEditor[],
    activity,
  };
}

export async function getWakaTimeStats(): Promise<WakaTimeStatsData> {
  const apiKey = process.env.WAKATIME_API_KEY;
  if (!apiKey) {
    return { ...wakatimeFallback };
  }

  try {
    const res = await fetch(
      `${WAKATIME_API}/users/current/summaries?range=${encodeURIComponent("Last 7 Days")}`,
      {
        headers: {
          Authorization: authHeader(apiKey),
          Accept: "application/json",
        },
        next: { revalidate: statsConfig.cache.wakatime },
      },
    );

    const json = await safeJson<WakaTimeSummariesResponse>(res);
    if (!json?.data) {
      return { ...wakatimeFallback, source: "unavailable" };
    }

    return aggregateFromSummaries(json);
  } catch (error) {
    console.error("WakaTime fetch failed:", error);
    return { ...wakatimeFallback, source: "unavailable" };
  }
}
