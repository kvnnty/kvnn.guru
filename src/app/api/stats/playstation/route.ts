import { NextResponse } from "next/server";
import { getPlaystationStats } from "@/lib/stats/playstation";

export const revalidate = 900;

export async function GET() {
  const data = await getPlaystationStats();
  return NextResponse.json(data);
}
