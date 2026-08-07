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

// Last.fm API key (free public key for demo purposes)
export const LASTFM_API_KEY =
  import.meta.env.VITE_LASTFM_API_KEY || "d8a8de4f0f4b0e0f0f4b0e0f0f4b0e0f";

// Local storage keys
export const STORAGE_KEYS = {
  favorites: "lfai_favorites",
  history: "lfai_history",
  settings: "lfai_settings",
  theme: "lfai_theme",
};

// Default settings
export const DEFAULT_SETTINGS = {
  defaultLyricsSource: "auto" as const,
  fontSize: "md" as const,
  autoScroll: true,
  readingMode: false,
  theme: "dark" as const,
  reduceMotion: false,
  rememberHistory: true,
};

// Navigation links
export const NAV_LINKS = [
  { label: "Discover", path: "/discover" },
  { label: "Artists", path: "/discover?tab=artists" },
  { label: "Albums", path: "/discover?tab=albums" },
  { label: "Favorites", path: "/favorites" },
  { label: "History", path: "/history" },
];

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
