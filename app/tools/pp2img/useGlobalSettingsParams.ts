import { useQueryStates, parseAsString, parseAsInteger, parseAsBoolean, createSerializer } from "nuqs";
import { useGlobalSettingsStore } from "./useGlobalSettingsStore";
import { useMemo } from "react";

const settingsParsers = {
  title: parseAsString,
  width: parseAsInteger,
  videoColor: parseAsString,
  adjColor: parseAsString,
  audioColor: parseAsString,
  transparentBg: parseAsBoolean,
};
export const serializeSettings = createSerializer(settingsParsers);

export function useGlobalSettingsParams() {
  const savedSettings = useGlobalSettingsStore((state) => state.settings);
  const parsers = useMemo(() => {
    return {
      title: parseAsString.withDefault(savedSettings.title),
      width: parseAsInteger.withDefault(savedSettings.width),
      videoColor: parseAsString.withDefault(savedSettings.videoColor),
      adjColor: parseAsString.withDefault(savedSettings.adjColor),
      audioColor: parseAsString.withDefault(savedSettings.audioColor),
      transparentBg: parseAsBoolean.withDefault(savedSettings.transparentBg),
    };
  }, [savedSettings]);

  return useQueryStates(parsers);
}
