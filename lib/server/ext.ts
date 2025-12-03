import "server-only";

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
      const url = new URL(`${this.URL}/channels`);
      url.searchParams.append("key", API_KEY);
      url.searchParams.append("part", "snippet, statistics");
      url.searchParams.append("id", id);

      const res = await (await fetch(url.toString())).json();

      if (res.items.length < 1) return Promise.reject();

      const data = res.items[0];

      return {
        id: data.id,
        channel_username: data.snippet.customUrl,
        statistics: data.statistics,
        snippet: {
          ...data.snippet,
          thumbnail:
            data.snippet.thumbnails?.maxres?.url ||
            data.snippet.thumbnails?.standard?.url ||
            data.snippet.thumbnails?.high?.url ||
            data.snippet.thumbnails?.medium?.url ||
            data.snippet.thumbnails?.default?.url ||
            "",
        },
      } as YtApiChannelData;
    }

    static channels(ids: string[]) {
      return Promise.all(ids.map(channelId => this.channel(channelId)))
    }

    static async video(id: string) {
      const url = new URL(`${this.URL}/videos`);
      url.searchParams.append("key", API_KEY);
      url.searchParams.append("part", "snippet, statistics");
      url.searchParams.append("id", id);

      const res = await (await fetch(url)).json();

      if (res.items.length < 1) return null;

      const data = res.items[0];

      return {
        id: data.id,
        statistics: data.statistics,
        snippet: {
          ...data.snippet,
          thumbnail:
            data.snippet.thumbnails?.maxres?.url ||
            data.snippet.thumbnails?.standard?.url ||
            data.snippet.thumbnails?.high?.url ||
            data.snippet.thumbnails?.medium?.url ||
            data.snippet.thumbnails?.default?.url ||
            "",
        },
      } as YtApiVideoData;
    }

    static async videos(ids: string[]) {
      const MAX_IDS_PER_REQUEST = 50;
      const promises: Promise<YtApiVideoData[]>[] = [];

      for (let i = 0; i < ids.length; i += MAX_IDS_PER_REQUEST) {
        const batchIds = ids.slice(i, i + MAX_IDS_PER_REQUEST);
        const allIds = batchIds.join(",");

        const url = new URL(`${this.URL}/videos`);
        url.searchParams.append("key", API_KEY);
        url.searchParams.append("part", "snippet, statistics");
        url.searchParams.append("id", allIds);

        const batchPromise = (async () => {
            const res = await (await fetch(url)).json();

            if (res.error) {
              return [];
            }

            const batchResult: YtApiVideoData[] = [];

            for (const data of res.items) {
              const ytData = {
                id: data.id,
                statistics: data.statistics,
                snippet: {
                  ...data.snippet,
                  thumbnail:
                    data.snippet.thumbnails?.maxres?.url ||
                    data.snippet.thumbnails?.standard?.url ||
                    data.snippet.thumbnails?.high?.url ||
                    data.snippet.thumbnails?.medium?.url ||
                    data.snippet.thumbnails?.default?.url ||
                    "",
                },
              } as YtApiVideoData;
              batchResult.push(ytData);
            }
            return batchResult;
        })();

        promises.push(batchPromise);
      }

      const allResults = await Promise.all(promises);
      const finalResult = allResults.flat();

      return finalResult;
    }
  }
}
