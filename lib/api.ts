import { Portfolio } from "./portfolio";
import { Repositories } from "./repos";
import { VideoData } from "./types";
import { ChatMessages, ChatStatus, ChatTimestamp } from "./types/chat";
import { GHActivity, GHActivityDate } from "./types/github";

export async function fetchPortfolio() {
  const url = `/api/videos`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch videos.");
  }

  const result = (await response.json()) as VideoData[];
  return new Portfolio(result.map((v) => ({ ...v, date: new Date(v.date) })));
}

export async function fetchVideo(id: string) {
  const url = `/api/videos/${id}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch video.");
  }

  const result = (await response.json()) as VideoData;
  result["date"] = new Date(result["date"]);

  return result;
}

export async function checkChatStatus() {
  const url = "/api/chat/status";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to check chat status.");
  }

  const result = (await response.json()) as ChatStatus;
  return result;
}

export async function getChat(): Promise<ChatMessages> {
  const url = "api/chat";
  const response = await fetch(url);

  if (response.status === 404) {
    return [] as ChatMessages;
  } else if (!response.ok) {
    throw new Error("Failed to get messages.");
  }

  const result = (await response.json()).messages as ChatMessages;
  return result;
}

export async function sendChat(
  message: string,
  name: string,
): Promise<ChatTimestamp> {
  const url = "/api/chat";
  const body = { message, name };
  const bodyJson = JSON.stringify(body);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: bodyJson,
  });

  if (!response.ok) {
    throw new Error("Failed to send message.");
  }

  const result = (await response.json()).ts as ChatTimestamp;
  if (!result) {
    throw new Error("Failed to send message. Timestamp missing.");
  }

  return result;
}

export async function endChat() {
  const url = "/api/chat";
  const response = await fetch(url, { method: "DELETE" });

  if (!response.ok) {
    throw new Error("Failed to end chat.");
  }

  const success = (await response.json()).success;
  return success;
}

export async function fetchGithubActivity(date: GHActivityDate) {
  const GITHUB_USER = "iancmy";
  const url = `/api/github/activity?username=${GITHUB_USER}&date=${date.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Error fetching Github Activity");
  }

  return (await response.json()) as GHActivity;
}

export async function fetchRepositories() {
  const url = "/api/github/repos";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Error fetching Repositories");
  }

  return new Repositories(await response.json());
}
