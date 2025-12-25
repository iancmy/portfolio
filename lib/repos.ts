interface RepoLicenseAttr {
  key: string;
  label: string;
  description: string;
}

interface RepoLicense {
  name: string;
  nickname: string; // default to "" to handle null
  url: string;
  description: string;
  conditions: RepoLicenseAttr[];
  limitations: RepoLicenseAttr[];
  permissions: RepoLicenseAttr[];
}

interface RepoReleaseAsset {
  name: string;
  downloadUrl: string;
  contentType: string;
  size: number;
}

interface RepoRelease {
  name: string;
  tagName: string;
  publishedAt: Date; // convert from string;
  url: string;
  description: string;
  releaseAssets: RepoReleaseAsset[]; // flatten from latestRelease.releaseAssets.nodes
}

interface RepoLanguage {
  name: string;
  color: string;
}

export interface RepoNode {
  name: string;
  description: string; // default to "" to handle null
  url: string;
  homepageUrl: string | null;
  stars: number; // from stargazerCount
  updatedAt: Date; // convert from string
  license: RepoLicense | null; // from licenseInfo
  latestRelease: RepoRelease | null;
  languages: RepoLanguage[]; // flatten from languages.nodes
}

export class Repositories {
  repos: RepoNode[];

  constructor(repos: any[] = []) {
    const allRepos = repos.map((r) => {
      return {
        name: r.name,
        description: r.description || "",
        url: r.url,
        homepageUrl: r.homepageUrl,
        stars: r.stargazerCount,
        updatedAt: new Date(r.updatedAt),
        license: r.licenseInfo
          ? {
              ...r.licenseInfo,
              nickname: r.licenseInfo.nickname || "",
            }
          : null,
        latestRelease: r.latestRelease
          ? {
              ...r.latestRelease,
              publishedAt: new Date(r.latestRelease.publishedAt),
              releaseAssets: r.latestRelease.releaseAssets?.nodes || [],
            }
          : null,
        languages: r.languages?.nodes || [],
      };
    });

    this.repos = allRepos;
  }

  get count() {
    return this.repos.length;
  }

  get totalStars() {
    return this.repos.map((r) => r.stars).reduce((p, c) => p + c, 0);
  }

  #filterLanguage(...which: string[]) {
    const filtered = this.repos.filter((r) =>
      which.some((w) => r.languages.some((l) => l.name === w)),
    );
  }

  #sortStars(asc = false) {
    const MULT = asc ? 1 : -1;
    const sorted = this.repos.toSorted((a, b) => {
      const diff = a.stars - b.stars;
      return diff * MULT;
    });

    return new Repositories(sorted);
  }

  get sort() {
    return {
      stars: {
        asc: () => this.#sortStars(true),
        desc: () => this.#sortStars()
      }
    }
  }
}
