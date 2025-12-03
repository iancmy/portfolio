import { VideoData } from "./types";
import { Activity } from "@/components/kibo-ui/contribution-graph";
import { clsx, type ClassValue } from "clsx";
import { formatISO } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toKebabCase(text: string): string {
  if (!text) {
    return "";
  }

  let slug = text.normalize("NFKD").replace(/\p{Diacritic}/gu, "");
  slug = slug.toLowerCase();
  slug = slug.replace(/[^a-z0-9\s-]/g, "-");
  slug = slug.replace(/[\s_-]+/g, "-");
  slug = slug.replace(/^-+|-+$/g, "");
  return slug;
}

export function shuffle<T>(originalArray: T[]): T[] {
  const array = [...originalArray];

  let currentIndex: number = array.length;

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function extractYouTubeId(url: string) {
  const regex = /(?:youtu\.be\/|v=|shorts\/)([^&?]+)/;
  const match = url.match(regex);

  if (match && match[1].length >= 11) {
    return match[1].substring(0, 11);
  }

  return "";
}

export function videoDataToActivity(videoData: VideoData[]): Activity[] {
  const dateCounts = new Map<string, number>();

  for (const video of videoData) {
    const rawDate = video.date;

    const dateString = formatISO(rawDate, { representation: "date" });
    const currentCount = dateCounts.get(dateString) || 0;
    dateCounts.set(dateString, currentCount + 1);
  }

  if (dateCounts.size === 0) {
    return [];
  }

  const activityData: Activity[] = Array.from(
    dateCounts.entries().map((dateCount) => {
      const [date, count] = dateCount;

      return { date, count, level: count === 1 ? 2 : count === 2 ? 3 : 4 };
    })
  );

  return activityData.sort((a, b) => a.date.localeCompare(b.date));
}
