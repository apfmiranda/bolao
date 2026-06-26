import { NextResponse } from "next/server";
import { readGames } from "@/lib/data";

export async function GET() {
  const data = await readGames();
  return NextResponse.json(data);
}

export const dynamic = "force-dynamic";
