import { NextResponse } from "next/server";
import { getXStats } from "@/lib/stats/x";

export const revalidate = 1800;

export async function GET() {
  const data = await getXStats();
  return NextResponse.json(data);
}
