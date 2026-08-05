import {
  StatsCard,
  StatsCardHeader,
  StatsStat,
} from "@/components/stats/stats-card";
import { getPlaystationStats } from "@/lib/stats/playstation";
import { formatNumber } from "@/lib/stats/utils";

export async function PlaystationCard() {
  const data = await getPlaystationStats();
  const lastPlayed = data.recentlyPlayed[0];
  const platform =
    data.currentlyPlaying?.platform || lastPlayed?.platform || "PS4";

  return (
    <StatsCard>
      <StatsCardHeader
        label="Gaming"
      />

      {data.currentlyPlaying ? (
        <div className="mb-5 flex items-center gap-4">
          {data.currentlyPlaying.imageUrl ? (
            <img
              src={data.currentlyPlaying.imageUrl}
              alt=""
              width={72}
              height={72}
              className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-lg object-cover ring-1 ring-border"
            />
          ) : (
            <div className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-lg bg-border/40" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Playing now
            </p>
            <p className="mt-1.5 truncate text-lg text-foreground">
              {data.currentlyPlaying.title}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-muted">
              {data.currentlyPlaying.platform}
            </p>
          </div>
        </div>
      ) : lastPlayed ? (
        <div className="flex items-center gap-4">
          {lastPlayed.imageUrl ? (
            <img
              src={lastPlayed.imageUrl}
              alt=""
              width={72}
              height={72}
              className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-lg object-cover ring-1 ring-border"
            />
          ) : (
            <div className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-lg bg-border/40" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Last played {lastPlayed.lastPlayed}
            </p>
            <p className="mt-1.5 truncate text-lg text-foreground">
              {lastPlayed.title}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-muted">
              {lastPlayed.platform}
            </p>
          </div>
        </div>
      ) : null}

      {data.available && data.trophies.total > 0 ? (
        <div className="mt-5 flex flex-wrap gap-8 border-t border-border pt-5">
          <StatsStat
            value={formatNumber(data.trophies.total)}
            label="Trophies"
          />
          <StatsStat value={data.trophies.platinum} label="Platinum" />
        </div>
      ) : null}
    </StatsCard>
  );
}
