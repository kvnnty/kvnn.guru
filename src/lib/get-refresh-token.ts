async function getRefreshToken() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
  const code = "YOUR_CODE";

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "https://localhost:3000/callback",
      }),
    });

    const data = await response.json();
    console.log("Your refresh token is:", data.refresh_token);
  } catch (error) {
    console.error("Error:", error);
  }
}

getRefreshToken();
