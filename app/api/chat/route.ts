import { SlackApi } from "@/lib/server/ext";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ChatSecure } from "@/lib/server/crypto";
import { isString } from "@/lib/utils";

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
    return NextResponse.json({ status: "No session.", messages: [] });

  const messages = await SlackApi.getThread(threadTs);
  return NextResponse.json({ messages });
}

const MESSAGE_CHAR_LIMIT = 300;
const NAME_CHAR_LIMIT = 20;
export async function POST(req: NextRequest) {
  let message = null;
  let name = null;

  try {
    const body = await req.json();
    message = body?.message;
    name = body?.name;
  } catch (e) {
    return NextResponse.json(
      { error: `${e}: Missing request body.` },
      { status: 400 },
    );
  }

  if (!message)
    return NextResponse.json({ error: "No message." }, { status: 400 });
  if (!name) return NextResponse.json({ error: "No name." }, { status: 400 });
  if (!isString(message) || !isString(name))
    return NextResponse.json(
      { error: "Invalid type. Message and name must be a string." },
      { status: 400 },
    );
  if (message.length > MESSAGE_CHAR_LIMIT || name.length > NAME_CHAR_LIMIT)
    return NextResponse.json(
      {
        error: `Too many characters. Message can only have ${MESSAGE_CHAR_LIMIT} characters. Name can only have ${NAME_CHAR_LIMIT} characters.`,
      },
      { status: 400 },
    );

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

  const newTs = await SlackApi.sendMessage(message, name, threadTs);

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

export async function DELETE() {
  const cookieStore = await cookies();
  const encryptedSession = cookieStore.get("chat_session")?.value;
  let threadTs: string | undefined;

  if (!encryptedSession) {
    cookieStore.delete("chat_session");
    return NextResponse.json(
      { error: "Invalid session. Chat session ended." },
      { status: 200 },
    );
  }

  try {
    threadTs = ChatSecure.decrypt(encryptedSession);
  } catch (e) {
    cookieStore.delete("chat_session");
    return NextResponse.json(
      { error: "Invalid session. Chat session ended." },
      { status: 200 },
    );
  }

  try {
    await SlackApi.endChatSession(threadTs);
  } catch (e) {
    console.error(e);
  }

  cookieStore.delete("chat_session");
  return NextResponse.json({ success: true });
}
