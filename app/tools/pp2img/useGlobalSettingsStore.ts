import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface GlobalSettings {
  title: string;
  width: number;
  videoColor: string;
  adjColor: string;
  audioColor: string;
  transparentBg: boolean;
}

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  title: "",
  width: 1920,
  videoColor: "#1C97E4",
  adjColor: "#B033C6",
  audioColor: "#7FAB5C",
  transparentBg: false,
};

interface GlobalSettingsState {
  settings: GlobalSettings;
  setSettings: (settings: GlobalSettings) => void;
}

export const useGlobalSettingsStore = create<GlobalSettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_GLOBAL_SETTINGS,
      setSettings: (newSettings) => set({ settings: newSettings }),
    }),
    {
      name: "pp2img-global-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
