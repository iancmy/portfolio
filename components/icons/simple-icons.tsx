import { cn, getLevenshteinDistance } from "@/lib/utils";
import * as icons from "simple-icons";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { CSSProperties, useMemo } from "react";

interface SimpleIconProps {
  name: string;
  className?: string;
  style?: CSSProperties;
}

const ALIAS_MAP: Record<string, string> = {
  html: "html5",
  java: "openjdk",
  shell: "gnubash",
  just: "gnubash",
  makefile: "gnu"
};

const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

const iconSearchMap = Object.keys(icons).reduce(
  (acc, key) => {
    const icon = (icons as any)[key];
    acc[normalize(icon.slug)] = key;
    acc[normalize(icon.title)] = key;
    return acc;
  },
  {} as Record<string, string>,
);

function findClosestKey(normalizedInput: string): keyof typeof icons | null {
  const searchKeys = Object.keys(iconSearchMap);

  if (iconSearchMap[normalizedInput]) {
    return iconSearchMap[normalizedInput] as keyof typeof icons;
  }

  const partialMatches = searchKeys
    .filter((key) => key.startsWith(normalizedInput))
    .sort((a, b) => a.length - b.length);

  if (partialMatches.length > 0) {
    const bestPartial = partialMatches[0];
    if (normalizedInput.length > 2 || bestPartial.length - normalizedInput.length < 3) {
      return iconSearchMap[bestPartial] as keyof typeof icons;
    }
  }

  let bestMatch: string | null = null;
  let minDistance = 2;

  for (const key of searchKeys) {
    const distance = getLevenshteinDistance(normalizedInput, key);
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = iconSearchMap[key];
    }
  }

  return bestMatch as keyof typeof icons;
}

export function SimpleIcon({ name, className, style }: SimpleIconProps) {
  const iconKey = useMemo(() => {
    const input = normalize(name);

    const resolvedName = ALIAS_MAP[input] || input;

    if (iconSearchMap[resolvedName]) {
      return iconSearchMap[resolvedName] as keyof typeof icons;
    }

    return findClosestKey(resolvedName);
  }, [name]);

  const icon = iconKey ? icons[iconKey] : null;

  if (!icon) {
    return (
      <Avatar className={cn("h-fit", className)}>
        <AvatarFallback className="text-xs">{name[0] || "?"}</AvatarFallback>
      </Avatar>
    );
  }

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={cn("w-12 h-fit", className)}
      style={{ ...style }}
    >
      <title>{icon.title}</title>
      <path d={icon.path} />
    </svg>
  );
}
