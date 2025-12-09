import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type StateSetter<T> = (value: T | ((prev: T) => T)) => void;

interface VideoPlayerState {
  playing: boolean;
  playRate: number;
  muted: boolean;
  volume: number;
  isFullscreen: boolean;

  setPlaying: StateSetter<boolean>;
  setPlayRate: StateSetter<number>;
  setMuted: StateSetter<boolean>;
  setVolume: StateSetter<number>;
  setIsFullscreen: StateSetter<boolean>;
}

export const useVideoPlayerStore = create<VideoPlayerState>()(
  persist(
    (set) => ({
      playing: true,
      playRate: 1,
      muted: false,
      volume: 1,
      isFullscreen: false,

      setPlaying: (input) =>
        set((state) => ({
          playing:
            typeof input === "function"
              ? (input as (prev: boolean) => boolean)(state.playing)
              : input,
        })),

      setPlayRate: (input) =>
        set((state) => ({
          playRate:
            typeof input === "function"
              ? (input as (prev: number) => number)(state.playRate)
              : input,
        })),

      setMuted: (input) =>
        set((state) => ({
          muted:
            typeof input === "function"
              ? (input as (prev: boolean) => boolean)(state.muted)
              : input,
        })),

      setVolume: (input) =>
        set((state) => ({
          volume:
            typeof input === "function"
              ? (input as (prev: number) => number)(state.volume)
              : input,
        })),

      setIsFullscreen: (input) =>
        set((state) => ({
          isFullscreen:
            typeof input === "function"
              ? (input as (prev: boolean) => boolean)(state.isFullscreen)
              : input,
        })),
    }),
    {
      name: "video-player-state",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
