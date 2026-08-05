import { NextResponse } from "next/server";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const FALLBACK_TRACK_ID = "51EC3I1nQXpec4gDk0mQyP";

const FALLBACK_TRACK = {
  title: "90210",
  artist: "Travis Scott",
  album: "Rodeo",
  albumImageUrl: "https://i.scdn.co/image/ab67616d00001e026cfd9a7353f98f5165ea6160",
  songUrl: `https://open.spotify.com/track/${FALLBACK_TRACK_ID}`,
  isPlaying: false,
};

async function getAccessToken() {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    return { error: "Missing Spotify environment variables" };
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    return {
      error: data.error_description || data.error || "Failed to get access token",
    };
  }

  return { accessToken: data.access_token };
}

function formatTrack(item: any, isPlaying: boolean) {
  return {
    title: item.name,
    artist: item.artists.map((artist: any) => artist.name).join(", "),
    album: item.album.name,
    albumImageUrl: item.album.images[0]?.url || "",
    songUrl: item.external_urls.spotify,
    isPlaying,
  };
}

async function getFallbackTrack(accessToken: string) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${FALLBACK_TRACK_ID}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return FALLBACK_TRACK;
    }

    const item = await response.json();
    return formatTrack(item, false);
  } catch {
    return FALLBACK_TRACK;
  }
}

export async function GET() {
  try {
    const tokenResult = await getAccessToken();

    if ("error" in tokenResult) {
      return NextResponse.json(FALLBACK_TRACK);
    }

    const { accessToken } = tokenResult;

    const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 204 || response.status === 202) {
      return NextResponse.json(await getFallbackTrack(accessToken));
    }

    if (!response.ok) {
      return NextResponse.json(await getFallbackTrack(accessToken));
    }

    const data = await response.json();

    if (!data.item) {
      return NextResponse.json(await getFallbackTrack(accessToken));
    }

    return NextResponse.json(formatTrack(data.item, data.is_playing));
  } catch (error) {
    console.error("Spotify API error:", error);
    return NextResponse.json(FALLBACK_TRACK);
  }
}
