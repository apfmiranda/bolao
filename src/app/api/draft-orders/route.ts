import { NextResponse } from "next/server";
import { readDraftOrders } from "@/lib/data";

export async function GET() {
  const data = await readDraftOrders();
  return NextResponse.json(data);
}

export const dynamic = "force-dynamic";
