import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HistoryItem } from "@/types";
import { STORAGE_KEYS } from "@/constants";

interface HistoryState {
  items: HistoryItem[];
  addItem: (item: Partial<HistoryItem>) => void;
  removeItem: (id: string) => void;
  clearHistory: () => void;
}

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const id = item.id;
        // Remove existing item with same id to move to top
        const filtered = get().items.filter((i) => i.id !== id);
        const newItem: HistoryItem = {
          id: id!,
          type: item.type!,
          title: item.title!,
          subtitle: item.subtitle,
          image: item.image,
          viewedAt: Date.now(),
          data: item.data,
        };
        const items = [newItem, ...filtered].slice(0, MAX_HISTORY);
        set({ items });
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      clearHistory: () => set({ items: [] }),
    }),
    {
      name: STORAGE_KEYS.history,
    },
  ),
);
