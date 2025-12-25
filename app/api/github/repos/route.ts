import { NextResponse } from "next/server";
import { GithubApi } from "@/lib/server/ext";

export async function GET() {
  try {
    const allRepos = await GithubApi.getAllRepositories();

    if (!allRepos || allRepos.length === 0)
      return NextResponse.json(
        { error: "No repositories found" },
        { status: 404 },
      );

    return NextResponse.json(
      allRepos.filter((r) => !r.isFork && !r.isPrivate),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
