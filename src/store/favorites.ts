import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FavoriteItem, Song, Artist, Album } from "@/types";
import { STORAGE_KEYS } from "@/constants";

interface FavoritesState {
  favorites: FavoriteItem[];
  isFavorite: (id: string, type: string) => boolean;
  toggleFavorite: (item: Partial<FavoriteItem>) => void;
  addFavorite: (item: Partial<FavoriteItem>) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  songIds: string[];
  artistIds: string[];
  albumIds: string[];
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      songIds: [],
      artistIds: [],
      albumIds: [],

      isFavorite: (id, type) =>
        get().favorites.some((f) => f.id === id && f.type === type),

      toggleFavorite: (item) => {
        const existing = get().favorites.find(
          (f) => f.id === item.id && f.type === item.type,
        );
        if (existing) {
          const favorites = get().favorites.filter((f) => f !== existing);
          set({
            favorites,
            songIds: favorites.filter((f) => f.type === "song").map((f) => f.id),
            artistIds: favorites.filter((f) => f.type === "artist").map((f) => f.id),
            albumIds: favorites.filter((f) => f.type === "album").map((f) => f.id),
          });
        } else {
          get().addFavorite(item);
        }
      },

      addFavorite: (item) => {
        const exists = get().favorites.some(
          (f) => f.id === item.id && f.type === item.type,
        );
        if (exists) return;
        const favorite: FavoriteItem = {
          id: item.id!,
          type: item.type!,
          title: item.title!,
          subtitle: item.subtitle,
          image: item.image,
          addedAt: Date.now(),
          data: item.data,
        };
        const favorites = [favorite, ...get().favorites];
        set({
          favorites,
          songIds: favorites.filter((f) => f.type === "song").map((f) => f.id),
          artistIds: favorites.filter((f) => f.type === "artist").map((f) => f.id),
          albumIds: favorites.filter((f) => f.type === "album").map((f) => f.id),
        });
      },

      removeFavorite: (id) => {
        const favorites = get().favorites.filter((f) => f.id !== id);
        set({
          favorites,
          songIds: favorites.filter((f) => f.type === "song").map((f) => f.id),
          artistIds: favorites.filter((f) => f.type === "artist").map((f) => f.id),
          albumIds: favorites.filter((f) => f.type === "album").map((f) => f.id),
        });
      },

      clearFavorites: () =>
        set({ favorites: [], songIds: [], artistIds: [], albumIds: [] }),
    }),
    {
      name: STORAGE_KEYS.favorites,
    },
  ),
);

// Helper to create a favorite from a song
export function songToFavorite(song: Song): FavoriteItem {
  return {
    id: song.id,
    type: "song",
    title: song.title,
    subtitle: song.artist,
    image: song.cover,
    addedAt: Date.now(),
    data: song,
  };
}

export function artistToFavorite(artist: Artist): FavoriteItem {
  return {
    id: artist.id,
    type: "artist",
    title: artist.name,
    subtitle: artist.genres?.[0],
    image: artist.image,
    addedAt: Date.now(),
    data: artist,
  };
}

export function albumToFavorite(album: Album): FavoriteItem {
  return {
    id: album.id,
    type: "album",
    title: album.title,
    subtitle: album.artist,
    image: album.cover,
    addedAt: Date.now(),
    data: album,
  };
}
