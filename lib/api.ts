import { Portfolio } from "./portfolio";
import {
  VideoData,
} from "./types";
import { ChatStatus } from "./types/chat";

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
  const url = `/api/videos/${id}`
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch video.");
  }

  const result = (await response.json()) as VideoData;
  result["date"] = new Date(result["date"])

  return result
}

export async function checkChatStatus() {
  const url = "/api/chat/status"
  const response = await fetch(url);

  if (!response.ok)  {
    throw new Error("Failed to check chat status.")
  }

  const result = (await response.json()) as ChatStatus;
  return result
}
