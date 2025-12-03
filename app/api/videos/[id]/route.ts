import { getVideo } from "@/lib/server/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, ctx: RouteContext<"/api/videos/[id]">) {
  const { id } = await ctx.params;
  const data = await getVideo(id);

  if (!data) return NextResponse.json({ status: 404 });

  return NextResponse.json(data);
}
