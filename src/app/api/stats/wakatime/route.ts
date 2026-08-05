import { NextResponse } from "next/server";
import { getWakaTimeStats } from "@/lib/stats/wakatime";

export const revalidate = 600;

export async function GET() {
  const data = await getWakaTimeStats();
  return NextResponse.json(data);
}
