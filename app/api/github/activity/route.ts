import { GithubApi } from "@/lib/server/ext";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  const dateQ = searchParams.get("date");

  if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });
  if (!dateQ) return NextResponse.json({ error: "Date required" }, { status: 400 });

  try {
    const date = dateQ === "present" ? dateQ : parseInt(dateQ)

    const res = await GithubApi.getActivity(username, date)

    if (!res) return NextResponse.json({ error: "GitHub API Error" }, { status: 500 });

    const json = await res.json();

    if (json.errors) {
      console.error(json.errors);
      return NextResponse.json({ error: "GitHub API Error" }, { status: 500 });
    }

    return NextResponse.json(
      json.data.user.contributionsCollection.contributionCalendar,
    );
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
