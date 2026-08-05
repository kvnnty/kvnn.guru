import {
  StatsCard,
  StatsCardHeader,
  StatsEmpty,
  StatsStat,
} from "@/components/stats/stats-card";
import { Sparkline } from "@/components/stats/charts";
import { RelativeTime } from "@/components/stats/relative-time";
import { getChessStats } from "@/lib/stats/chess";

const resultMark: Record<"win" | "loss" | "draw", string> = {
  win: "W",
  loss: "L",
  draw: "D",
};

export async function ChessCard() {
  const data = await getChessStats();

  if (data.source === "unavailable" && data.currentRating == null) {
    return (
      <StatsCard href={data.profileUrl}>
        <StatsCardHeader label="Chess.com" href={data.profileUrl} />
        <StatsEmpty message="Set CHESS_USERNAME to show chess stats." />
      </StatsCard>
    );
  }

  return (
    <StatsCard>
      <StatsCardHeader
        label="Chess.com"
        meta={
          data.streak.count > 1 && data.streak.type
            ? `${data.streak.count}${resultMark[data.streak.type]} streak`
            : undefined
        }
        href={data.profileUrl}
      />

      <div className="flex flex-wrap gap-8">
        <StatsStat
          value={data.currentRating ?? "—"}
          label="Rating"
        />
        <StatsStat
          value={data.peakRating ?? "—"}
          label="Peak"
        />
      </div>

      {data.ratingHistory.length > 1 ? (
        <div className="mt-4">
          <Sparkline values={data.ratingHistory} />
        </div>
      ) : null}

      <div className="mt-5 flex gap-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        <span>{data.record.wins}W</span>
        <span className="text-border">/</span>
        <span>{data.record.losses}L</span>
        <span className="text-border">/</span>
        <span>{data.record.draws}D</span>
      </div>

      {data.recentGames.length > 0 ? (
        <ul className="mt-5 space-y-2 border-t border-border pt-4">
          {data.recentGames.slice(0, 4).map((g) => (
            <li key={`${g.url}-${g.playedAt}`}>
              <a
                href={g.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-baseline justify-between gap-3 text-sm group"
              >
                <span className="min-w-0 truncate text-foreground group-hover:text-accent">
                  <span className="mr-2 font-mono text-[10px] text-muted">
                    {resultMark[g.result]}
                  </span>
                  vs {g.opponent}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-muted">
                  <RelativeTime date={g.playedAt} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </StatsCard>
  );
}
