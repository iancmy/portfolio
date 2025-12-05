import { SlackApi } from "@/lib/server/ext";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ChatSecure } from "@/lib/server/crypto";

export async function GET(_: NextRequest) {
  const cookieStore = await cookies();
  const encryptedSession = cookieStore.get("chat_session")?.value;

  let threadTs: string | undefined;

  if (encryptedSession) {
    try {
      threadTs = ChatSecure.decrypt(encryptedSession);
    } catch (e) {
      cookieStore.delete("chat_session");
      return NextResponse.json(
        { error: "Invalid session cookie." },
        { status: 400 },
      );
    }
  }

  if (!threadTs || !encryptedSession)
    return NextResponse.json({ error: "No session." }, { status: 404 });

  const messages = await SlackApi.getThread(threadTs);
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  let message = null;

  try {
    const body = await req.json();
    message = body?.message;
  } catch (e) {
    return NextResponse.json(
      { error: `${e}: Missing request body.` },
      { status: 400 },
    );
  }

  if (!message)
    return NextResponse.json({ error: "No message." }, { status: 400 });

  const cookieStore = await cookies();
  const encryptedSession = cookieStore.get("chat_session")?.value;

  let threadTs: string | undefined;

  if (encryptedSession) {
    try {
      threadTs = ChatSecure.decrypt(encryptedSession);
    } catch (e) {
      cookieStore.delete("chat_session");
      return NextResponse.json(
        { error: "Invalid session cookie." },
        { status: 400 },
      );
    }
  }

  const newTs = await SlackApi.sendMessage(message, threadTs);

  if (!newTs)
    return NextResponse.json(
      { error: "Failed to send to Slack" },
      { status: 500 },
    );

  // if threadTs exists => don't overwrite threadTs / dont save the newTs as cookie
  // new thread => save the new ts encrypted as cookie
  const sessionToStore = threadTs || newTs;
  const encryptedToStore = ChatSecure.encrypt(sessionToStore);
  cookieStore.set("chat_session", encryptedToStore, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  // always => send newTs as timestamp
  return NextResponse.json({ timestamp: newTs });
}
