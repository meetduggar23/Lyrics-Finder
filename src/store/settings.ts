import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Settings } from "@/types";
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "@/constants";

interface SettingsState {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  setFontSize: (size: Settings["fontSize"]) => void;
  toggleAutoScroll: () => void;
  toggleReadingMode: () => void;
  toggleReduceMotion: () => void;
  toggleTheme: () => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: { ...DEFAULT_SETTINGS } as Settings,

      updateSettings: (updates) =>
        set({ settings: { ...get().settings, ...updates } }),

      setFontSize: (fontSize) =>
        set({ settings: { ...get().settings, fontSize } }),

      toggleAutoScroll: () =>
        set({
          settings: {
            ...get().settings,
            autoScroll: !get().settings.autoScroll,
          },
        }),

      toggleReadingMode: () =>
        set({
          settings: {
            ...get().settings,
            readingMode: !get().settings.readingMode,
          },
        }),

      toggleReduceMotion: () =>
        set({
          settings: {
            ...get().settings,
            reduceMotion: !get().settings.reduceMotion,
          },
        }),

      toggleTheme: () =>
        set({
          settings: {
            ...get().settings,
            theme: get().settings.theme === "dark" ? "light" : "dark",
          },
        }),

      resetSettings: () =>
        set({ settings: { ...DEFAULT_SETTINGS } as Settings }),
    }),
    {
      name: STORAGE_KEYS.settings,
    },
  ),
);
