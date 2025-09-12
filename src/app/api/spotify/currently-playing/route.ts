import { NextResponse } from "next/server";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

async function getAccessToken() {
  console.log(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN)
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN!,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ error: "Failed to get access token" });
    }

    const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 204 || response.status === 202) {
      // No content - nothing is playing
      return NextResponse.json(null);
    }

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch currently playing" });
    }

    const data = await response.json();

    if (!data.item) {
      return NextResponse.json(null);
    }

    const track = {
      title: data.item.name,
      artist: data.item.artists.map((artist: any) => artist.name).join(", "),
      album: data.item.album.name,
      albumImageUrl: data.item.album.images[0]?.url || "",
      songUrl: data.item.external_urls.spotify,
      isPlaying: data.is_playing,
    };

    return NextResponse.json(track);
  } catch (error) {
    console.error("Spotify API error:", error);
    return NextResponse.json({ error: "Internal server error" });
  }
}
