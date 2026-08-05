import { NextResponse } from "next/server";
import { getGithubStats } from "@/lib/stats/github";

export const revalidate = 300;

export async function GET() {
  const data = await getGithubStats();
  return NextResponse.json(data);
}
