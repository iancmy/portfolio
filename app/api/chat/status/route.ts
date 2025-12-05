import { NextRequest, NextResponse } from "next/server";
import { SlackApi } from "@/lib/server/ext";

export async function GET(_: NextRequest) {
  const isActive = await SlackApi.checkActive();
  return NextResponse.json({ status: isActive ? "online" : "offline" });
}
