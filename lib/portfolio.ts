import {
  ClientData,
  VideoCategories,
  VideoData,
  VideoRoles,
  VideoTypes,
  YtClient,
  YtVideoData,
} from "./types";
import createFuzzySearch from "@nozbe/microfuzz";

type SearchPreprocess =
  | {
      category: "filter";
      type: string;
      op: string;
      value: string;
    }
  | {
      category: "sort";
      type: string;
      direction: string;
    };

export class Portfolio<T extends VideoData = VideoData> {
  videos: T[];

  constructor(videos: T[] = []) {
    this.videos = videos;
  }

  get count() {
    return this.videos.length;
  }

  get yt() {
    const ytVideos = this.videos.filter((v) => v.is_yt && v?.channel_src && v?.views && v?.likes) as YtVideoData[];
    return new Portfolio<YtVideoData>(ytVideos);
  }

  #calcClientViews(client: string) {
    return this.yt.videos
      .filter((v) => v.client === client)
      .map((v) => v.views)
      .reduce((p, c) => p + c, 0);
  }

  #calcClientLikes(client: string) {
    return this.yt.videos
      .filter((v) => v.client === client)
      .map((v) => v.likes)
      .reduce((p, c) => p + c, 0);
  }

  #calcClientVideos(client: string) {
    return this.videos.filter((v) => v.client === client).length;
  }

  #getClientVideos(client: string) {
    return this.videos.filter((v) => v.client === client);
  }

  #createClientData(video: VideoData) {
    const clientData: Partial<YtClient> = {
      name: video.client,
      client_avatar: video.client_avatar,
      count: this.#calcClientVideos(video.client),
      videos: this.#getClientVideos(video.client) as YtVideoData[],
    };

    if (video.is_yt) {
      const ytVideo = video as YtVideoData;

      clientData["channel_src"] = ytVideo.channel_src;
      clientData["total_views"] = this.#calcClientViews(video.client);
      clientData["total_likes"] = this.#calcClientLikes(video.client);
      clientData["total_subs"] = video.subs;
    }

    return clientData as ClientData;
  }

  get clients() {
    const uniqueClientsMap = this.videos.reduce((map, video) => {
      const clientData = this.#createClientData(video);
      if (!map.has(clientData.name)) map.set(clientData.name, clientData);
      return map;
    }, new Map<string, ClientData>());

    return Array.from(uniqueClientsMap.values());
  }

  get totalViews() {
    return this.yt.videos.map((v) => v.views).reduce((p, c) => p + c, 0);
  }

  get totalLikes() {
    return this.yt.videos.map((v) => v.likes).reduce((p, c) => p + c, 0);
  }

  #filterRoles(...which: VideoRoles[]) {
    const filtered = this.videos.filter((v) =>
      which.some((w) => v.role.includes(w)),
    );
    return new Portfolio(filtered);
  }

  #filterTypes(...which: VideoTypes[]) {
    const filtered = this.videos.filter((v) =>
      which.some((w) => v.type.includes(w)),
    );
    return new Portfolio(filtered);
  }

  #filterCategories(...which: VideoCategories[]) {
    const filtered = this.videos.filter((v) =>
      which.some((w) => v.category.includes(w)),
    );
    return new Portfolio(filtered);
  }

  #parseQuery(query: string) {
    if (query.includes("..")) {
      const [start, end] = query.split("..");
      return { type: "range", start, end };
    }

    const match = query.match(/^([<>]=?)(.+)$/);
    if (match) {
      return { type: "compare", op: match[1], val: match[2] };
    }

    return { type: "exact", val: query };
  }

  #filterDate(query: string) {
    const parsed = this.#parseQuery(query);
    const filtered = this.videos.filter((v) => {
      // example "2024-01-01..2025-01-01"
      if (parsed.type === "range") {
        const start = new Date(parsed.start!);
        const end = new Date(parsed.end!);
        return v.date >= start && v.date <= end;
      }

      // example "<=2025-01-01"
      const qDate = new Date(parsed.val!);
      if (parsed.type === "compare") {
        if (parsed.op === ">=") return v.date >= qDate;
        if (parsed.op === "<=") return v.date <= qDate;
        if (parsed.op === ">") return v.date > qDate;
        if (parsed.op === "<") return v.date < qDate;
      }

      // default exact
      return v.date.getTime() === qDate.getTime();
    });

    return new Portfolio(filtered);
  }

  #filterViews(query: string) {
    const parsed = this.#parseQuery(query);
    const filtered = this.videos.filter((v) => {
      // example "10000..50000"
      if (parsed.type === "range") {
        const start = parseInt(parsed.start!);
        const end = parseInt(parsed.end!);

        let views = 0;
        if (v.is_yt) {
          views += (v as YtVideoData).views;
        }

        return views >= start && views <= end;
      }

      // example "<=50000"
      const qViews = parseInt(parsed.val!);
      if (parsed.type === "compare") {
        if (parsed.op === ">=") return (v.is_yt ? v.views : 0) >= qViews;
        if (parsed.op === "<=") return (v.is_yt ? v.views : 0) <= qViews;
        if (parsed.op === ">") return (v.is_yt ? v.views : 0) > qViews;
        if (parsed.op === "<") return (v.is_yt ? v.views : 0) < qViews;
      }

      // default exact
      return (v.is_yt ? v.views : 0) === qViews;
    });

    return new Portfolio(filtered);
  }

  #filterLikes(query: string) {
    const parsed = this.#parseQuery(query);
    const filtered = this.videos.filter((v) => {
      // example "10000..50000"
      if (parsed.type === "range") {
        const start = parseInt(parsed.start!);
        const end = parseInt(parsed.end!);

        let likes = 0;
        if (v.is_yt) {
          likes += (v as YtVideoData).likes;
        }

        return likes >= start && likes <= end;
      }

      // example "<=50000"
      const qLikes = parseInt(parsed.val!);
      if (parsed.type === "compare") {
        if (parsed.op === ">=") return (v.is_yt ? v.likes : 0) >= qLikes;
        if (parsed.op === "<=") return (v.is_yt ? v.likes : 0) <= qLikes;
        if (parsed.op === ">") return (v.is_yt ? v.likes : 0) > qLikes;
        if (parsed.op === "<") return (v.is_yt ? v.likes : 0) < qLikes;
      }

      // default exact
      return (v.is_yt ? v.likes : 0) === qLikes;
    });

    return new Portfolio(filtered);
  }

  #filterIds(...ids: string[]) {
    const filtered = this.videos.filter(v => ids.includes(v.id))
    return new Portfolio(filtered)
  }

  get filter() {
    return {
      roles: (...which: VideoRoles[]) => this.#filterRoles(...which),
      types: (...which: VideoTypes[]) => this.#filterTypes(...which),
      categories: (...which: VideoCategories[]) =>
        this.#filterCategories(...which),

      date: (query: string) => this.#filterDate(query),
      views: (query: string) => this.#filterViews(query),
      likes: (query: string) => this.#filterLikes(query),

      id: (...ids: string[]) => this.#filterIds(...ids)
    };
  }

  #sortDate(asc = false) {
    const MULT = asc ? 1 : -1;
    const sorted = this.videos.toSorted((a, b) => {
      const diff = a.date.getTime() - b.date.getTime();
      return diff * MULT;
    });

    return new Portfolio(sorted);
  }

  #sortTitle(asc = false) {
    const MULT = asc ? 1 : -1;
    const sorted = this.videos.toSorted((a, b) => {
      const comp = a.title.localeCompare(b.title);
      return comp * MULT;
    });

    return new Portfolio(sorted);
  }

  #sortClient(asc = false) {
    const MULT = asc ? 1 : -1;
    const sorted = this.videos.toSorted((a, b) => {
      const comp = a.client.localeCompare(b.client);
      return comp * MULT;
    });

    return new Portfolio(sorted);
  }

  #sortId(asc = false) {
    const MULT = asc ? 1 : -1;
    const sorted = this.videos.toSorted((a, b) => {
      const comp = a.id.localeCompare(b.id, undefined, { numeric: true });
      return comp * MULT;
    });

    return new Portfolio(sorted);
  }

  #sortViews(asc = false) {
    const MULT = asc ? 1 : -1;
    const sorted = this.videos.toSorted((a, b) => {
      if (!a.is_yt) return 1
      if (!b.is_yt) return -1

      const diff = a.views - b.views;
      return diff * MULT;
    });

    return new Portfolio(sorted);
  }

  #sortLikes(asc = false) {
    const MULT = asc ? 1 : -1;
    const sorted = this.videos.toSorted((a, b) => {
      if (!a.is_yt) return 1
      if (!b.is_yt) return -1

      const diff = a.likes - b.likes;
      return diff * MULT;
    });

    return new Portfolio(sorted);
  }

  get sort() {
    return {
      date: {
        oldest: () => this.#sortDate(true),
        asc: () => this.#sortDate(true),
        latest: () => this.#sortDate(),
        desc: () => this.#sortDate()
      },
      title: {
        asc: () => this.#sortTitle(true),
        desc: () => this.#sortTitle(),
      },
      client: {
        asc: () => this.#sortClient(true),
        desc: () => this.#sortClient(),
      },
      id: {
        asc: () => this.#sortId(true),
        desc: () => this.#sortId(),
      },
      views: {
        asc: () => this.#sortViews(true),
        desc: () => this.#sortViews(),
      },
      likes: {
        asc: () => this.#sortLikes(true),
        desc: () => this.#sortLikes(),
      },
    };
  }

  #prefilter(prefilter: Extract<SearchPreprocess, { category: "filter" }>) {
    if (prefilter.type === "roles") {
      const value = prefilter.value.split(",") as VideoRoles[];
      return this.filter.roles(...value);
    } else if (prefilter.type === "types") {
      const value = prefilter.value.split(",") as VideoTypes[];
      return this.filter.types(...value);
    } else if (prefilter.type === "categories") {
      const value = prefilter.value.split(",") as VideoCategories[];
      return this.filter.categories(...value);
    } else if (prefilter.type === "date") {
      return this.filter.date(
        prefilter.value.includes("..")
          ? prefilter.value
          : `${prefilter.op}${prefilter.value}`,
      );
    } else if (prefilter.type === "views") {
      return this.filter.views(
        prefilter.value.includes("..")
          ? prefilter.value
          : `${prefilter.op}${prefilter.value}`,
      );
    } else if (prefilter.type === "likes") {
      return this.filter.likes(
        prefilter.value.includes("..")
          ? prefilter.value
          : `${prefilter.op}${prefilter.value}`,
      );
    } else if (prefilter.type === "ids") {
      const value = prefilter.value.split(",")
      return this.filter.id(...value)
    }

    return this;
  }

  #presort(presort: Extract<SearchPreprocess, { category: "sort" }>) {
    if (presort.type === "date") {
      return presort.direction === "asc" || presort.direction === "oldest" ? this.sort.date.oldest() : this.sort.date.latest()
    }
    else if (presort.type === "title") {
      return presort.direction === "asc" ? this.sort.title.asc() : this.sort.title.desc()
    }
    else if (presort.type === "client") {
      return presort.direction === "asc" ? this.sort.client.asc() : this.sort.client.desc()
    }
    else if (presort.type === "id") {
      return presort.direction === "asc" ? this.sort.id.asc() : this.sort.id.desc()
    }
    else if (presort.type === "views") {
      return presort.direction === "asc" ? this.sort.views.asc() : this.sort.views.desc()
    }
    else if (presort.type === "likes") {
      return presort.direction === "asc" ? this.sort.likes.asc() : this.sort.likes.desc()
    }

    return this;
  }

  search(query: string) {
    const preprocessR =
      /\[(?:(sort):([^:]*?):([^\]]*?)|([^\]]*?)(=|[<>]=?)([^\]]*?))\]/g;
    const preprocess: SearchPreprocess[] = [...query.matchAll(preprocessR)].map(
      (m) =>
        m[1]
          ? { category: "sort", type: m[2], direction: m[3] }
          : { category: "filter", type: m[4], op: m[5], value: m[6] },
    );

    const processed = preprocess.reduce(
      (p, c) => (c.category === "sort" ? p.#presort(c) : p.#prefilter(c)),
      this as Portfolio<T>,
    );

    const searchQ = query.replace(preprocessR, "").trim();
    if (!searchQ) return processed

    const fuzzy = createFuzzySearch<T>(processed.videos, {
      getText: (video) => [video.title, video.description, video.client],
    });

    return new Portfolio(fuzzy(searchQ).map(r => r.item));
  }

  head(count: number) {
    return new Portfolio(this.videos.slice(0, count))
  }

  tail(count: number) {
    return new Portfolio(this.videos.slice(-count))
  }

  get max() {
    return {
      views: this.sort.views.desc().videos[0]?.views || 200_000_000,
      likes: this.sort.likes.desc().videos[0]?.likes || 20_000_000,
      date: this.sort.date.latest().videos[0]?.date || new Date()
    }
  }

  get min() {
    return {
      views: this.sort.views.asc().videos[0]?.views || 0,
      likes: this.sort.likes.asc().videos[0]?.likes || 0,
      date: this.sort.date.oldest().videos[0]?.date || new Date("1/1/2010")
    }
  }
}
