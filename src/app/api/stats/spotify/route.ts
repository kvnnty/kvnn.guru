import { NextResponse } from "next/server";
import { getSpotifyStats } from "@/lib/stats/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getSpotifyStats();
  return NextResponse.json(data);
}
