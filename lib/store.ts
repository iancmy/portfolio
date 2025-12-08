import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface VideoQueueState {
  queue: string[];
  history: string[];
  current: string | null;
  index: number;
  setCurrent: (id: string) => void;
  setQueue: (ids: string[]) => void;
  prev: () => string | null;
  next: () => string | null;
  peekHistory: () => string | null;
}

export const useVideoQueueStore = create<VideoQueueState>()(
  persist(
    (set, get) => ({
      queue: [],
      history: [],
      current: null,
      index: -1,
      setQueue: (ids) =>
        set({
          queue: ids,
          history: [],
          current: null,
          index: -1,
        }),
      setCurrent: (id) => {
        const { queue, history } = get();
        if (!queue.includes(id)) set({ current: null, index: -1 });
        else {
          set({
            current: id,
            index: queue.indexOf(id),
            history: [...history, id],
          });
        }
      },
      prev: () => {
        const { queue, index } = get();
        return index === -1 ? null : queue[index - 1] || null;
      },
      next: () => {
        const { queue, index } = get();
        return index === -1 ? null : queue[index + 1] || null;
      },
      peekHistory: () => {
        const { history } = get();
        const prev = history.at(-1);

        if (!prev) return null;
        return prev;
      },
    }),
    {
      name: "video-queue-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
