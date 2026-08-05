"use client";

import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  StatsCard,
  StatsCardHeader,
  StatsEmpty,
} from "@/components/stats/stats-card";
import { cn } from "@/lib/utils";

interface SpotifyTrack {
  title: string;
  artist: string;
  albumImageUrl: string;
  songUrl: string;
  isPlaying: boolean;
}

function VinylDisc({
  imageUrl,
  spinning,
}: {
  imageUrl?: string;
  spinning?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative size-14 shrink-0 rounded-full",
        "shadow-[0_2px_8px_rgb(26_25_22/0.12)]",
        spinning && "animate-vinyl",
      )}
      aria-hidden
    >
      <div className="relative size-full overflow-hidden rounded-full bg-foreground/90 ring-1 ring-foreground/10">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            width={56}
            height={56}
            className="size-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="size-full bg-border/60" />
        )}

        {/* Thin vinyl rim */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            boxShadow:
              "inset 0 0 0 2px rgb(26 25 22 / 0.45), inset 0 0 0 3px rgb(250 248 244 / 0.08)",
          }}
        />

        {/* Spindle */}
        <div className="absolute top-1/2 left-1/2 size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface shadow-[0_0_0_1.5px_rgb(26_25_22/0.35)]" />
      </div>
    </div>
  );
}

/** Listening card for the Stats grid — polls the existing Spotify route */
export function ListeningCard() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get("/api/spotify/currently-playing");
        if (data && !data.error) setTrack(data);
      } catch {
        /* quiet fail */
      } finally {
        setLoaded(true);
      }
    };
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  if (!loaded) {
    return (
      <StatsCard>
        <StatsCardHeader label="Listening" />
        <div className="flex gap-4">
          <div className="size-14 animate-pulse rounded-full bg-border/50" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 w-2/3 animate-pulse rounded bg-border/50" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-border/40" />
          </div>
        </div>
      </StatsCard>
    );
  }

  if (!track) {
    return (
      <StatsCard>
        <StatsCardHeader label="Listening" />
        <StatsEmpty message="Nothing playing right now." />
      </StatsCard>
    );
  }

  return (
    <StatsCard href={track.songUrl}>
      <StatsCardHeader
        label="Listening"
        meta={track.isPlaying ? "Listening now" : "Played recently"}
      />
      <div className="flex items-center gap-4">
        <VinylDisc
          imageUrl={track.albumImageUrl || undefined}
          spinning={track.isPlaying}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base text-foreground">{track.title}</p>
          <p className="mt-0.5 truncate text-sm text-muted">{track.artist}</p>
        </div>
        <Image
          src="/spotify.svg"
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px] shrink-0 opacity-60"
        />
      </div>
    </StatsCard>
  );
}
