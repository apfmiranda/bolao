import { NextResponse } from "next/server";
import { readPredictions } from "@/lib/data";

export async function GET() {
  const data = await readPredictions();
  return NextResponse.json(data);
}

export const dynamic = "force-dynamic";
