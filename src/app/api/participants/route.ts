import { NextResponse } from "next/server";
import { readParticipants } from "@/lib/data";

export async function GET() {
  const data = await readParticipants();
  return NextResponse.json(data);
}

export const dynamic = "force-dynamic";
