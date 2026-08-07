// Application-wide constants and configuration

export const APP_NAME = "Lyrics Finder AI";
export const APP_TAGLINE =
  "Discover Lyrics. Explore Artists. Feel the Music.";
export const APP_VERSION = "1.0.0";

// API endpoints
export const API = {
  deezer: "https://corsproxy.io/?url=https://api.deezer.com",
  ovh: "https://corsproxy.io/?url=https://api.lyrics.ovh/v1",
  lrcLib: "https://corsproxy.io/?url=https://lrclib.net/api",
  itunes: "https://corsproxy.io/?url=https://itunes.apple.com",
  lastfm: "https://ws.audioscrobbler.com/2.0",
};

// AudD recognition token (optional — set VITE_AUDD_API_KEY in .env)
export const AUDD_API_TOKEN = import.meta.env.VITE_AUDD_API_KEY || "";

// Local storage keys
export const STORAGE_KEYS = {
  favorites: "lfai_favorites",
  history: "lfai_history",
  settings: "lfai_settings",
};

// Default settings
export const DEFAULT_SETTINGS = {
  defaultLyricsSource: "auto" as const,
  fontSize: "md" as const,
  autoScroll: true,
  readingMode: false,
  reduceMotion: false,
  rememberHistory: true,
};

// Placeholder images
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTgxODE4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPuaLmeiDheWwj+itiDwvdGV4dD48L3N2Zz4=";

// Duration formats
export const DEFAULT_FONT_SIZES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};
