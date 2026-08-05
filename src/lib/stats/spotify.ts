import type { SpotifyStatsData, SpotifyTrack } from "./types";
import { safeJson } from "./utils";

const FALLBACK_TRACK_ID = "51EC3I1nQXpec4gDk0mQyP";

/** Shown when nothing is playing (or Spotify auth is unavailable) */
const FALLBACK_TRACK: SpotifyTrack = {
  title: "90210",
  artist: "Travis Scott",
  album: "Rodeo",
  albumImageUrl:
    "https://i.scdn.co/image/ab67616d00001e026cfd9a7353f98f5165ea6160",
  songUrl: `https://open.spotify.com/track/${FALLBACK_TRACK_ID}`,
  isPlaying: false,
};

interface SpotifyArtist {
  name: string;
}

interface SpotifyApiTrack {
  name: string;
  artists: SpotifyArtist[];
  album: {
    name: string;
    images: { url: string }[];
  };
  external_urls: { spotify: string };
}

function formatTrack(item: SpotifyApiTrack, isPlaying: boolean): SpotifyTrack {
  return {
    title: item.name,
    artist: item.artists.map((artist) => artist.name).join(", "),
    album: item.album.name,
    albumImageUrl: item.album.images[0]?.url || "",
    songUrl: item.external_urls.spotify,
    isPlaying,
  };
}

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await safeJson<{ error?: string; error_description?: string }>(
      response,
    );
    console.error(
      "Spotify token refresh failed:",
      err?.error ?? response.status,
      err?.error_description ?? "",
    );
    return null;
  }

  const data = await safeJson<{ access_token?: string }>(response);
  return data?.access_token ?? null;
}

async function getFallbackTrack(accessToken: string | null): Promise<SpotifyTrack> {
  if (!accessToken) return FALLBACK_TRACK;

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/tracks/${FALLBACK_TRACK_ID}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 86400 },
      },
    );
    const item = await safeJson<SpotifyApiTrack>(response);
    if (!item) return FALLBACK_TRACK;
    return formatTrack(item, false);
  } catch {
    return FALLBACK_TRACK;
  }
}

export async function getSpotifyStats(): Promise<SpotifyStatsData> {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return { source: "fallback", track: FALLBACK_TRACK };
    }

    const response = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    );

    // 204 = nothing playing right now → show 90210 as recent fallback
    if (response.status === 204 || response.status === 202) {
      return {
        source: "synced",
        track: await getFallbackTrack(accessToken),
      };
    }

    if (!response.ok) {
      console.error("Spotify currently-playing failed:", response.status);
      return {
        source: "fallback",
        track: await getFallbackTrack(accessToken),
      };
    }

    const data = await safeJson<{
      item?: SpotifyApiTrack;
      is_playing?: boolean;
    }>(response);

    if (!data?.item) {
      return {
        source: "synced",
        track: await getFallbackTrack(accessToken),
      };
    }

    return {
      source: "synced",
      track: formatTrack(data.item, Boolean(data.is_playing)),
    };
  } catch (error) {
    console.error("Spotify fetch failed:", error);
    return { source: "fallback", track: FALLBACK_TRACK };
  }
}
