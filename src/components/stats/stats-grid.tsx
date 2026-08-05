import { Suspense } from "react";
import { ChessCard } from "@/components/stats/chess-card";
import { GithubCard } from "@/components/stats/github-card";
import { ListeningCard } from "@/components/stats/listening-card";
import { StatsCardSkeleton } from "@/components/stats/stats-card";
import { PlaystationCard } from "@/components/stats/playstation-card";
import { WakaTimeCard } from "@/components/stats/wakatime-card";
import { XCard } from "@/components/stats/x-card";

/** Full stats dashboard grid — used on /stats */
export function StatsGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      <Suspense
        fallback={<StatsCardSkeleton className="sm:col-span-2 lg:col-span-2" lines={4} />}
      >
        <GithubCard />
      </Suspense>

      <Suspense fallback={<StatsCardSkeleton lines={3} />}>
        <ListeningCard />
      </Suspense>

      <Suspense
        fallback={<StatsCardSkeleton className="sm:col-span-2 lg:col-span-2" lines={5} />}
      >
        <WakaTimeCard />
      </Suspense>

      <div className="flex flex-col gap-5 sm:gap-6">
        <Suspense fallback={<StatsCardSkeleton lines={4} />}>
          <ChessCard />
        </Suspense>

        <Suspense fallback={<StatsCardSkeleton lines={3} />}>
          <PlaystationCard />
        </Suspense>
      </div>

      <Suspense
        fallback={<StatsCardSkeleton className="sm:col-span-2 lg:col-span-3" lines={3} />}
      >
        <XCard />
      </Suspense>
    </div>
  );
}
