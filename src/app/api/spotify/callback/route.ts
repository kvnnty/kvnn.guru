import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json({ error: `Spotify authorization error: ${error}` });
  }

  if (!code) {
    return NextResponse.json({ error: "No authorization code provided" });
  }

  try {
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
    const REDIRECT_URI = `${process.env.APP_HOST}/api/spotify/callback`;

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error_description });
    }

    return NextResponse.json({
      message: "🎉 SUCCESS! Copy the refresh_token below to your .env file",
      instructions: "Add this line to your .env file:",
      env_line: `SPOTIFY_REFRESH_TOKEN=${data.refresh_token}`,
      refresh_token: data.refresh_token,
      access_token: data.access_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to exchange code for tokens", details: error });
  }
}
