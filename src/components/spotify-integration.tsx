"use client";

import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SpotifyTrack {
  title: string;
  artist: string;
  albumImageUrl: string;
  songUrl: string;
  isPlaying: boolean;
}

export default function NowPlaying() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get("/api/spotify/currently-playing");
        if (data && !data.error) setTrack(data);
      } catch {
        /* quiet fail */
      }
    };
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  if (!track) return null;

  return (
    <a
      href={track.songUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-full items-center gap-3 rounded-xl bg-surface px-3 py-2 ring-1 ring-border transition-colors hover:ring-foreground/20"
    >
      {track.albumImageUrl ? (
        <img
          src={track.albumImageUrl}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-md object-cover"
        />
      ) : null}
      <span className="min-w-0 flex-1 space-y-1">
        <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          {track.isPlaying ? "Listening now" : "Played recently"}
        </span>
        <span className="block truncate text-sm text-foreground">
          {track.title}
          <span className="text-muted"> · {track.artist}</span>
        </span>
      </span>
      <Image
        src="/spotify.svg"
        alt="Spotify"
        width={20}
        height={20}
        className="ml-5 h-5 w-5 shrink-0"
      />
    </a>
  );
}
