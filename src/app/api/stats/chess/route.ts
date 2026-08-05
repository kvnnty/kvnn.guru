import { NextResponse } from "next/server";
import { getChessStats } from "@/lib/stats/chess";

export const revalidate = 600;

export async function GET() {
  const data = await getChessStats();
  return NextResponse.json(data);
}
