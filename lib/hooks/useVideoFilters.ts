import {
  useQueryStates,
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
} from "nuqs";
import { useMemo } from "react";

export interface FilterDefaults {
  roles?: string[],
  types?: string[],
  categories?: string[],
  ids?: string[],

  date?: number[],
  views?: number[],
  likes?: number[]
}

export const filterParsers = (defaults?: FilterDefaults) => {
  return {
    roles: parseAsArrayOf(parseAsString).withDefault(defaults?.roles || []),
    types: parseAsArrayOf(parseAsString).withDefault(defaults?.types || []),
    categories: parseAsArrayOf(parseAsString).withDefault(defaults?.categories || []),
    ids: parseAsArrayOf(parseAsString).withDefault(defaults?.ids || []),

    date: parseAsArrayOf(parseAsInteger, ":").withDefault(defaults?.date || []),
    views: parseAsArrayOf(parseAsInteger, "..").withDefault(defaults?.views || []),
    likes: parseAsArrayOf(parseAsInteger, "..").withDefault(defaults?.likes || []),
  };
};

export function useVideoFilters(defaults?: FilterDefaults) {
  const parsers = useMemo(() => {
    return filterParsers(defaults);
  }, [defaults]);

  return useQueryStates(parsers);
}

export type UseVideoFiltersReturn = ReturnType<typeof useVideoFilters>;
