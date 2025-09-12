"use client";

import { Music } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

interface SpotifyTrack {
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
  isPlaying: boolean;
}

export default function NowPlaying() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentlyPlaying = async () => {
      try {
        const { data } = await axios.get("/api/spotify/currently-playing");

        if (!data) {
          setError("Currently not playing anything");
          return;
        }
        setTrack(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching currently playing:", err);
        setError("Failed to fetch current track");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentlyPlaying();

    const interval = setInterval(fetchCurrentlyPlaying, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-3 p-4 border rounded-lg animate-pulse">
        <div className="w-20 h-20 bg-primary-foreground rounded"></div>
        <div className="flex-1">
          <div className="h-4 bg-primary-foreground rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-primary-foreground rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!track || error) {
    return (
      <div className="flex items-center space-x-3 p-4 border rounded-lg">
        <div className="w-16 h-16 bg-primary-foreground rounded flex items-center justify-center">
          <Music className="text-primary" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-primary">Currently not playing anything</p>
          <p className="text-sm text-muted-foreground">Open Spotify and play a song!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:shadow-md transition-shadow group">
      <img src={track.albumImageUrl} alt={`${track.album} cover`} className="w-16 h-16 rounded object-cover" />
      <div className="flex-1 min-w-0 space-y-1">
        <a
          href={track.songUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary group-hover:text-green-600 transition-colors block truncate">
          {track.title}
        </a>
        <p className="text-sm text-muted-foreground truncate">by {track.artist}</p>
      </div>
      <div className="flex flex-col items-end">
        {track.isPlaying ? (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Playing</span>
          </div>
        ) : (
          <span className="text-xs text-gray-500 font-medium">Paused</span>
        )}
        <div className="text-xs text-muted-foreground mt-1">Spotify</div>
      </div>
    </div>
  );
}
