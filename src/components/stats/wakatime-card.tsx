import {
  StatsCard,
  StatsCardHeader,
  StatsEmpty,
  StatsStat,
} from "@/components/stats/stats-card";
import {
  ActivityBars,
  LanguageBars,
  SegmentedBar,
} from "@/components/stats/charts";
import { getWakaTimeStats } from "@/lib/stats/wakatime";
import { formatNumber } from "@/lib/stats/utils";

function formatCodingTime(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours <= 0 && minutes <= 0) return "0 mins";
  if (hours <= 0) return `${minutes} min${minutes === 1 ? "" : "s"}`;
  if (minutes <= 0) return hours === 1 ? "1 hr" : `${hours} hrs`;
  return `${hours} hr${hours === 1 ? "" : "s"} ${minutes} mins`;
}

export async function WakaTimeCard() {
  const data = await getWakaTimeStats();

  const hasActivity =
    data.totalSeconds > 0 ||
    data.aiLineChanges > 0 ||
    data.inputTokens > 0 ||
    data.languages.length > 0 ||
    data.editors.length > 0 ||
    data.activity.some((d) => d.seconds > 0);

  if (
    (data.source === "fallback" || data.source === "unavailable") &&
    !hasActivity
  ) {
    return (
      <StatsCard className="sm:col-span-2" href={data.profileUrl}>
        <StatsCardHeader label="WakaTime" href={data.profileUrl} />
        <StatsEmpty message="Set WAKATIME_API_KEY to show coding & AI stats." />
      </StatsCard>
    );
  }

  const totalTokens = data.inputTokens + data.outputTokens;
  const lineTotal = data.aiLineChanges + data.humanLineChanges;
  const aiShare = lineTotal > 0 ? data.aiLineChanges / lineTotal : 0;
  const humanShare = lineTotal > 0 ? data.humanLineChanges / lineTotal : 0;
  const showWeekChart = data.activity.some((d) => d.seconds > 0);

  return (
    <StatsCard className="sm:col-span-2">
      <StatsCardHeader
        label="WakaTime"
        meta="Last 7 days"
        href={data.profileUrl}
      />

      <div className="flex flex-wrap gap-8 sm:gap-10">
        <StatsStat value={data.humanReadableTotal} label="Coded" />
        <StatsStat
          value={data.humanReadableDailyAverage}
          label="Daily avg"
        />
        <StatsStat value={`${data.aiDrivenPercent}%`} label="AI-driven" />
      </div>

      <div className="mt-5 flex flex-wrap gap-8 sm:gap-10">
        <StatsStat value={formatNumber(totalTokens)} label="Tokens" />
        <StatsStat value={formatNumber(data.prompts)} label="Prompts" />
        <StatsStat
          value={formatNumber(data.aiLineChanges)}
          label="AI lines"
        />
      </div>

      {showWeekChart ? (
        <div className="mt-6 border-t border-border pt-5">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            This week
          </p>
          <ActivityBars
            data={data.activity.map((a) => ({
              label: a.day.slice(0, 1),
              value: a.seconds,
              detail: `${a.day} · ${formatCodingTime(a.seconds)}`,
            }))}
          />
        </div>
      ) : null}

      {(data.languages.length > 0 ||
        data.editors.length > 0 ||
        lineTotal > 0 ||
        data.topModel) && (
        <div className="mt-6 grid gap-6 border-t border-border pt-5 sm:grid-cols-2">
          {data.languages.length > 0 ? (
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                Languages
              </p>
              <LanguageBars
                languages={data.languages.slice(0, 3).map((l) => ({
                  name: l.name,
                  share: l.percent,
                }))}
              />
            </div>
          ) : null}

          <div className="space-y-5">
            {data.editors.length > 0 ? (
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                  IDEs & tools
                </p>
                <LanguageBars
                  languages={data.editors.slice(0, 3).map((e) => ({
                    name: e.name,
                    share: e.percent,
                  }))}
                />
              </div>
            ) : null}

            {data.topModel ? (
              <p className="text-sm text-muted">
                Top model{" "}
                <span className="text-foreground">{data.topModel.name}</span>
              </p>
            ) : null}

            {lineTotal > 0 ? (
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                  Lines
                </p>
                <SegmentedBar
                  segments={[
                    {
                      id: "ai",
                      label: `AI ${formatNumber(data.aiLineChanges)}`,
                      share: aiShare,
                    },
                    {
                      id: "human",
                      label: `Human ${formatNumber(data.humanLineChanges)}`,
                      share: humanShare,
                    },
                  ].filter((s) => s.share > 0)}
                />
              </div>
            ) : null}
          </div>
        </div>
      )}
    </StatsCard>
  );
}
