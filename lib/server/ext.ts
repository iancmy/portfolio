import "server-only";
import { WebClient } from "@slack/web-api";

export namespace GoogleApi {
  const BASE_URL = "https://www.googleapis.com";
  const API_KEY = process.env.YT_DATA_API || "";

  interface YtApiVideoData {
    id: string;
    snippet: {
      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      thumbnail: string;
    };
    contentDetails: {
      duration: string;
    };
    statistics: {
      viewCount: string;
      likeCount: string;
      commentCount: string;
      subscriberCount: string;
      videoCount: string;
    };
  }

  interface YtApiChannelData extends YtApiVideoData {
    channel_username: string;
  }

  export class Youtube {
    static URL = BASE_URL + "/youtube/v3";

    static async channel(id: string) {
      const results = await this.channels([id]);
      return results[0] || null;
    }

    static async channels(ids: string[]) {
      if (ids.length === 0) return [];

      const MAX_IDS_PER_REQUEST = 50;
      const uniqueIds = Array.from(new Set(ids));
      const promises: Promise<YtApiChannelData[]>[] = [];

      for (let i = 0; i < uniqueIds.length; i += MAX_IDS_PER_REQUEST) {
        const batchIds = uniqueIds.slice(i, i + MAX_IDS_PER_REQUEST);
        const url = new URL(`${this.URL}/channels`);
        url.searchParams.append("key", API_KEY);
        url.searchParams.append("part", "snippet, contentDetails, statistics");
        url.searchParams.append("id", batchIds.join(","));

        promises.push(
          (async () => {
            const res = await fetch(url.toString());

            if (!res.ok) {
              console.error(
                `YouTube API Error: ${res.status} ${res.statusText}`,
              );
              return [];
            }

            const data = await res.json();
            if (!data.items) return [];

            return data.items.map((item: any) => ({
              id: item.id,
              channel_username: item.snippet.customUrl,
              statistics: item.statistics,
              snippet: {
                ...item.snippet,
                thumbnail:
                  item.snippet.thumbnails?.maxres?.url ||
                  item.snippet.thumbnails?.standard?.url ||
                  item.snippet.thumbnails?.high?.url ||
                  item.snippet.thumbnails?.medium?.url ||
                  item.snippet.thumbnails?.default?.url ||
                  "",
              },
            })) as YtApiChannelData[];
          })(),
        );
      }
      const allResults = await Promise.all(promises);
      return allResults.flat();
    }

    static async video(id: string) {
      const results = await this.videos([id]);
      return results[0] || null;
    }

    static async videos(ids: string[]) {
      if (ids.length === 0) return [];

      const MAX_IDS_PER_REQUEST = 50;
      const promises: Promise<YtApiVideoData[]>[] = [];

      for (let i = 0; i < ids.length; i += MAX_IDS_PER_REQUEST) {
        const batchIds = ids.slice(i, i + MAX_IDS_PER_REQUEST);
        const url = new URL(`${this.URL}/videos`);
        url.searchParams.append("key", API_KEY);
        url.searchParams.append("part", "snippet, contentDetails, statistics");
        url.searchParams.append("id", batchIds.join(","));

        promises.push(
          (async () => {
            const res = await fetch(url.toString());

            if (!res.ok) {
              console.error(
                `YouTube API Error: ${res.status} ${res.statusText}`,
              );
              return [];
            }

            const data = await res.json();
            if (!data.items) return [];

            return data.items.map((item: any) => ({
              id: item.id,
              statistics: item.statistics,
              contentDetails: item.contentDetails,
              snippet: {
                ...item.snippet,
                thumbnail:
                  item.snippet.thumbnails?.maxres?.url ||
                  item.snippet.thumbnails?.standard?.url ||
                  item.snippet.thumbnails?.high?.url ||
                  item.snippet.thumbnails?.medium?.url ||
                  item.snippet.thumbnails?.default?.url ||
                  "",
              },
            })) as YtApiVideoData[];
          })(),
        );
      }

      const allResults = await Promise.all(promises);
      return allResults.flat();
    }
  }
}

export namespace SlackApi {
  const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
  const CHANNEL_ID = process.env.SLACK_CHANNEL_ID!;
  const ADMIN_ID = process.env.SLACK_ADMIN_ID!;

  export async function checkActive() {
    try {
      const result = await slack.users.getPresence({ user: ADMIN_ID });
      return result.presence === "active";
    } catch (error) {
      console.error("Slack check active error:", error);
      return false;
    }
  }

  export async function sendMessage(
    text: string,
    name: string,
    threadTs?: string,
  ) {
    try {
      const result = await slack.chat.postMessage({
        channel: CHANNEL_ID,
        text: text,
        username: name,
        thread_ts: threadTs, // if null it creates new parent message
      });
      return result.ts;
    } catch (error) {
      console.error("Slack send error:", error);
      throw error;
    }
  }

  export async function endChatSession(
    threadTs: string,
  ) {
    try {
      const result = await slack.chat.postMessage({
        channel: CHANNEL_ID,
        text: `========= CHAT ENDED =========`,
        thread_ts: threadTs, // if null it creates new parent message
      });
      return result.ts;
    } catch (error) {
      console.error("Slack send error:", error);
      throw error;
    }
  }

  export async function getThread(threadTs: string) {
    try {
      const result = await slack.conversations.replies({
        channel: CHANNEL_ID,
        ts: threadTs,
      });

      return (
        result.messages?.map((msg) => {
          return {
            text: msg.text || "",
            name: (msg as any).username || "DOM",
            isUser: !!msg.bot_id,
            ts: msg.ts,
          };
        }) || []
      );
    } catch (error) {
      console.error("Slack retrieve error:", error);
      return [];
    }
  }
}
