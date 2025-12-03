import { NextResponse } from "next/server";
import { getVideos } from "@/lib/server/utils";

export async function GET() {
  return NextResponse.json(await getVideos());
}
