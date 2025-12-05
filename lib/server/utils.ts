import "server-only";

import fs from "fs";
import path from "path";
import TOML from "smol-toml";

import { extractYouTubeId, parseISODuration, toKebabCase } from "../utils";
import { VideoData, VideoToml, YtVideoData } from "../types";
import { GoogleApi } from "./ext";

export const videosTomlPath = path.join(process.cwd(), "data", "videos.toml");

export function parseVideos() {
  const fileContent = fs.readFileSync(videosTomlPath, "utf-8");

  const videosToml = Object.values(
    TOML.parse(fileContent)["videos"],
  ) as unknown as VideoToml[];

  const videos = videosToml.map((video, i) => {
    const description = video?.description || "";
    const src = video.is_yt ? video.ext_src : video?.src || video?.fallback_src || video?.ext_src || "";
    const data = {
      ...video,
      description,
      src,
      id: `${i}-${toKebabCase(video.title)}`,
      date: new Date(video.date),
    };
    return data as VideoData;
  });

  return videos;
}

export async function getVideo(id: string): Promise<VideoData | null> {
  const parsedVideos = parseVideos();
  const video = parsedVideos.find((video) => video.id === id);

  if (!video) return null;

  const result = {
    ...video,
    client_avatar: "/images/unknown.png",
    thumbnail: "/images/default_thumb.jpg",
  } as VideoData;

  const ytId = extractYouTubeId(video.src);
  const ytData = await GoogleApi.Youtube.video(ytId);
  if (!ytData) return result;

  result["thumbnail"] = ytData.snippet.thumbnail;

  const duration = parseISODuration(ytData.contentDetails.duration);
  result["duration"] = duration;

  if (video.is_yt) {
    const ytResult = result as YtVideoData;
    ytResult["title"] = ytData.snippet.title;
    ytResult["date"] = new Date(ytData.snippet.publishedAt);
    ytResult["views"] = parseInt(ytData.statistics.viewCount);
    ytResult["likes"] = parseInt(ytData.statistics.likeCount);

    const clientData = await GoogleApi.Youtube.channel(
      ytData.snippet.channelId,
    );
    if (!clientData) return ytResult;

    ytResult["client"] = clientData.snippet.title;
    ytResult["client_avatar"] = clientData.snippet.thumbnail;

    const channelUrl = new URL(
      `https://youtube.com/${clientData.channel_username}`,
    );
    ytResult["channel_src"] = channelUrl.toString();
    ytResult["subs"] = parseInt(clientData.statistics.subscriberCount);

    return ytResult;
  }

  return result;
}

export async function getVideos() {
  const parsedVideos = parseVideos();

  const srcs = parsedVideos.map((video) => video.src);
  const ytIds = srcs.map((src) => extractYouTubeId(src));
  const ytData = await GoogleApi.Youtube.videos(ytIds);

  const clientIds = ytData
    .filter((ytVideo) => {
      const found = parsedVideos.find(
        (video) => extractYouTubeId(video.src) === ytVideo.id,
      );
      return found && found.is_yt;
    })
    .map((ytVideo) => ytVideo.snippet.channelId);
  const clientData = await GoogleApi.Youtube.channels(
    Array.from(new Set(clientIds)),
  );

  const videos = parsedVideos.map((video) => {
    const result = {
      ...video,
      client_avatar: "/images/unknown.png",
      thumbnail: "/images/default_thumb.jpg",
    } as VideoData;

    const id = extractYouTubeId(video.src);
    const found = ytData.find((ytVideo) => ytVideo.id === id);
    if (!found) return result;

    result["thumbnail"] = found.snippet.thumbnail;
    const duration = parseISODuration(found.contentDetails.duration);
    result["duration"] = duration;

    if (video.is_yt) {
      const ytResult = result as YtVideoData;
      ytResult["title"] = found.snippet.title;
      ytResult["date"] = new Date(found.snippet.publishedAt);
      ytResult["views"] = parseInt(found.statistics.viewCount);
      ytResult["likes"] = parseInt(found.statistics.likeCount);

      const channelId = found.snippet.channelId;
      const foundChannel = clientData.find(
        (ytChannel) => ytChannel.id === channelId,
      );
      if (!foundChannel) return ytResult;

      ytResult["client"] = foundChannel.snippet.title;
      ytResult["client_avatar"] = foundChannel.snippet.thumbnail;

      const channelUrl = new URL(
        `https://youtube.com/${foundChannel.channel_username}`,
      );
      ytResult["channel_src"] = channelUrl.toString();
      ytResult["subs"] = parseInt(foundChannel.statistics.subscriberCount);

      return ytResult;
    }

    return result;
  });

  return videos;
}
