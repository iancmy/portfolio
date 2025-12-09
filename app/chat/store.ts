import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ChatInfoState {
  name: string | null;
  setName: (name: string | null) => void;
}

export const useChatInfoStore = create<ChatInfoState>()(
  persist(
    (set) => ({
      name: null,
      setName: (name) => set({ name }),
    }),
    {
      name: "chat-info-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
