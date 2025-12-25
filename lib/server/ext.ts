import "server-only";
import { WebClient } from "@slack/web-api";
import { subDays } from "date-fns";
import { GHActivityDate } from "../types/github";

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

  export async function endChatSession(threadTs: string) {
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

export namespace GithubApi {
  const ACTIVITY_API_KEY = process.env.GITHUB_ACTIVITY;
  const GITHUB_API_KEY = process.env.GITHUB_API;
  const GITHUB_USER = "iancmy";
  const GITHUB_ORG = "sudomnc";

  export async function getActivity(username: string, date: GHActivityDate) {
    const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
      }
    }
  `;
    let from, to;

    if (typeof date === "number") {
      from = `${date}-01-01T00:00:00Z`;
      to = `${date}-12-31T23:59:59Z`;
    } else if (date === "present") {
      const now = new Date();
      to = now.toISOString();
      from = subDays(now, 365).toISOString();
    } else {
      throw new Error("Invalid date");
    }

    try {
      const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACTIVITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables: { username, from, to } }),
      });

      if (!res.ok) throw new Error("Error fetching Github Activity");

      return res;
    } catch (e) {
      console.error(e);
    }
  }

  export async function getAllRepositories(): Promise<any[]> {
    const personalRepos = await fetchAllNodes("user", GITHUB_USER);
    const orgRepos = await fetchAllNodes("organization", GITHUB_ORG);

    return [...orgRepos, ...personalRepos];
  }

  async function fetchAllNodes(type: "user" | "organization", login: string) {
    let allNodes: any[] = [];
    let hasNextPage = true;
    let afterCursor: string | null = null;

    const query = `
      query($login: String!, $after: String) {
        ${type}(login: $login) {
          repositories(first: 100, after: $after, orderBy: {field: UPDATED_AT, direction: DESC}) {
            nodes {
              name
              description
              url
              homepageUrl
              isFork
              isPrivate
              stargazerCount
              updatedAt
              licenseInfo {
                name
                nickname
                url
                description
                conditions { key label description }
                limitations { key label description }
                permissions { key label description }
              }
              latestRelease {
                name
                tagName
                publishedAt
                url
                description
                releaseAssets(first: 50) {
                  nodes {
                    name
                    downloadUrl
                    contentType
                    size
                  }
                }
              }
              languages(first: 3, orderBy: {field: SIZE, direction: DESC}) {
                nodes {
                  name
                  color
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

    while (hasNextPage) {
      try {
        const res: any = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GITHUB_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            variables: { login, after: afterCursor },
          }),
        });

        const json = await res.json();

        if (json.errors) {
          console.error(`GraphQL Error for ${login}:`, json.errors);
          break;
        }

        const data = json.data[type].repositories;
        allNodes = [...allNodes, ...data.nodes];

        hasNextPage = data.pageInfo.hasNextPage;
        afterCursor = data.pageInfo.endCursor;
      } catch (e) {
        console.error(`Fetch error for ${login}:`, e);
        break;
      }
    }

    return allNodes;
  }
}
