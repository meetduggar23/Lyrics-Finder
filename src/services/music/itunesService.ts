import { itunesClient } from "@/api/client";
import {
  searchSongs as deezerSearchSongs,
  searchArtists as deezerSearchArtists,
  searchAlbums as deezerSearchAlbums,
} from "@/services/deezer";
import type { Song, Artist, Album, SearchResults, SearchSuggestion } from "@/types";

/**
 * Official Apple iTunes Search API service (no authentication required).
 * https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/
 *
 * India (IN) is the primary storefront so Hindi / Bollywood / regional content
 * is found first. When a storefront returns nothing, the next one is tried and
 * finally the existing Deezer service is used as a fallback provider.
 *
 * All calls go through the shared proxied client, which URL-encodes the query
 * term (including Hindi Unicode) into the full request URL.
 */

const STOREFRONTS = ["IN", "US", "GB"] as const;

interface ITunesTrack {
  wrapperType: string;
  kind?: string;
  trackId: number;
  artistId: number;
  collectionId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl30?: string;
  artworkUrl60?: string;
  artworkUrl100?: string;
  artworkUrl600?: string;
  trackTimeMillis?: number;
  previewUrl?: string;
  releaseDate?: string;
  primaryGenreName?: string;
  trackViewUrl?: string;
  artistViewUrl?: string;
  country?: string;
}

interface ITunesArtist {
  wrapperType: string;
  artistType?: string;
  artistId: number;
  artistName: string;
  artworkUrl30?: string;
  artworkUrl60?: string;
  artworkUrl100?: string;
  primaryGenreName?: string;
  country?: string;
  artistLinkUrl?: string;
}

interface ITunesCollection {
  wrapperType: string;
  collectionType?: string;
  collectionId: number;
  artistId: number;
  artistName: string;
  collectionName: string;
  artworkUrl60?: string;
  artworkUrl100?: string;
  releaseDate?: string;
  primaryGenreName?: string;
  trackCount?: number;
  collectionViewUrl?: string;
  artistViewUrl?: string;
}

const largeArtwork = (url?: string) =>
  url?.replace(/\/100x100(?:bb|cc)?\.jpg$/, "/600x600bb.jpg");

function mapSong(r: ITunesTrack): Song {
  const artwork = r.artworkUrl100 || r.artworkUrl60;
  return {
    id: `it-${r.trackId}`,
    title: r.trackName,
    artist: r.artistName,
    artistId: `it-artist-${r.artistId}`,
    album: r.collectionName,
    albumId: `it-album-${r.collectionId}`,
    cover: artwork,
    coverSmall: r.artworkUrl60,
    coverMedium: artwork,
    coverLarge: r.artworkUrl600 || largeArtwork(r.artworkUrl100),
    duration: r.trackTimeMillis ? Math.round(r.trackTimeMillis / 1000) : undefined,
    previewUrl: r.previewUrl,
    link: r.trackViewUrl || r.artistViewUrl,
    releaseYear: r.releaseDate ? new Date(r.releaseDate).getFullYear() : undefined,
    source: "itunes",
  };
}

function mapArtist(r: ITunesArtist): Artist {
  const image = r.artworkUrl100 || r.artworkUrl60;
  return {
    id: `it-artist-${r.artistId}`,
    name: r.artistName,
    image,
    imageSmall: r.artworkUrl60,
    imageMedium: r.artworkUrl100,
    imageLarge: largeArtwork(r.artworkUrl100),
    genres: r.primaryGenreName ? [r.primaryGenreName] : [],
    country: r.country,
    source: "itunes",
  };
}

function mapAlbum(r: ITunesCollection): Album {
  return {
    id: `it-album-${r.collectionId}`,
    title: r.collectionName,
    artist: r.artistName,
    artistId: `it-artist-${r.artistId}`,
    cover: r.artworkUrl100,
    coverSmall: r.artworkUrl60,
    coverMedium: r.artworkUrl100,
    coverLarge: largeArtwork(r.artworkUrl100),
    releaseDate: r.releaseDate,
    genre: r.primaryGenreName,
    trackCount: r.trackCount,
    source: "itunes",
  };
}

type SearchEntity = "song" | "musicArtist" | "album";

async function fetchResults<R>(
  query: string,
  entity: SearchEntity,
  limit: number,
  country: string,
): Promise<R[]> {
  const { data } = await itunesClient.get("/search", {
    params: {
      term: query,
      country,
      media: "music",
      entity,
      limit,
    },
  });
  return (data?.results ?? []) as R[];
}

async function searchWithStorefronts<T, R>(
  query: string,
  entity: SearchEntity,
  limit: number,
  mapper: (result: R) => T,
  fallback: () => Promise<T[]>,
  countries: readonly string[] = STOREFRONTS,
): Promise<T[]> {
  for (const country of countries) {
    try {
      const results = await fetchResults<R>(query, entity, limit, country);
      if (results.length > 0) return results.map(mapper);
    } catch {
      // Storefront unavailable — try the next one.
    }
  }
  try {
    return await fallback();
  } catch {
    return [];
  }
}

/**
 * Search songs by title or artist.
 * Defaults to the India storefront first; pass `countries` to force a
 * specific storefront (e.g. US/GB for the English pool).
 */
export async function searchSongs(
  query: string,
  limit = 25,
  countries: readonly string[] = STOREFRONTS,
): Promise<Song[]> {
  return searchWithStorefronts<Song, ITunesTrack>(
    query,
    "song",
    limit,
    mapSong,
    () => deezerSearchSongs(query, limit),
    countries,
  );
}

/** Search artists (India storefront first). */
export async function searchArtists(query: string, limit = 10): Promise<Artist[]> {
  return searchWithStorefronts<Artist, ITunesArtist>(
    query,
    "musicArtist",
    limit,
    mapArtist,
    () => deezerSearchArtists(query, limit),
  );
}

/** Search albums (India storefront first). */
export async function searchAlbums(query: string, limit = 10): Promise<Album[]> {
  return searchWithStorefronts<Album, ITunesCollection>(
    query,
    "album",
    limit,
    mapAlbum,
    () => deezerSearchAlbums(query, limit),
  );
}

/** Combined search across songs, artists, and albums. */
export async function searchAll(query: string): Promise<SearchResults> {
  const [songs, artists, albums] = await Promise.allSettled([
    searchSongs(query),
    searchArtists(query),
    searchAlbums(query),
  ]);
  const songsList = songs.status === "fulfilled" ? songs.value : [];
  const artistsList = artists.status === "fulfilled" ? artists.value : [];
  const albumsList = albums.status === "fulfilled" ? albums.value : [];
  return {
    songs: songsList,
    artists: artistsList,
    albums: albumsList,
    totalResults: songsList.length + artistsList.length + albumsList.length,
  };
}

/** Get a single song's details by iTunes track id (accepts `it-` prefix). */
export async function getSongDetails(trackId: string): Promise<Song | null> {
  const id = trackId.replace(/^it-/, "");
  if (!/^\d+$/.test(id)) return null;
  for (const country of STOREFRONTS) {
    try {
      const { data } = await itunesClient.get("/lookup", {
        params: { id, country, entity: "song" },
      });
      const results: ITunesTrack[] = data?.results ?? [];
      const track = results.find(
        (r) =>
          r.wrapperType === "track" &&
          r.kind === "song" &&
          String(r.trackId) === id,
      );
      if (track) return mapSong(track);
    } catch {
      // Try the next storefront.
    }
  }
  return null;
}

/**
 * Autocomplete suggestions backed by the real search APIs (iTunes first,
 * Deezer as fallback). Results are ranked so exact matches, then prefix
 * matches, outrank loose partial matches.
 */

const MAX_SUGGESTIONS = 5;
const SUGGESTION_CACHE_TTL_MS = 5 * 60 * 1000;
const suggestionCache = new Map<string, { items: SearchSuggestion[]; fetchedAt: number }>();

const normalize = (s: string) => s.trim().toLocaleLowerCase();

function rankCandidate(
  query: string,
  title: string,
  artist: string,
): number {
  const q = normalize(query);
  if (!q) return 0;
  const t = normalize(title);
  const a = normalize(artist);

  // 1. Exact song title
  if (t === q) return 110;
  // 2. Exact artist
  if (a === q) return 100;
  // 3. Title starts with query
  if (t.startsWith(q)) return 80;
  // 4. Artist starts with query
  if (a.startsWith(q)) return 70;
  // 5. Partial title match
  if (t.includes(q)) return 50;
  // 6. Partial artist match
  if (a.includes(q)) return 40;

  // Multi-word query (e.g. "arijit tum"): every token must appear.
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const haystack = `${t} ${a}`;
    if (tokens.every((token) => haystack.includes(token))) return 30;
    if (tokens.some((token) => t.startsWith(token) || a.startsWith(token))) return 20;
  }
  return 0;
}

/**
 * Fetch ranked suggestions for the autocomplete dropdown.
 * Queries shorter than 2 characters return no results, and repeated queries
 * are served from an in-memory cache (5 minutes) without hitting the API.
 */
export async function searchSuggestions(query: string): Promise<SearchSuggestion[]> {
  const q = normalize(query);
  if (q.length < 2) return [];

  const cached = suggestionCache.get(q);
  if (cached && Date.now() - cached.fetchedAt < SUGGESTION_CACHE_TTL_MS) {
    return cached.items;
  }

  const [songsRes, artistsRes, albumsRes] = await Promise.allSettled([
    searchSongs(query, 8),
    searchArtists(query, 4),
    searchAlbums(query, 4),
  ]);

  const songs = songsRes.status === "fulfilled" ? songsRes.value : [];
  const artists = artistsRes.status === "fulfilled" ? artistsRes.value : [];
  const albums = albumsRes.status === "fulfilled" ? albumsRes.value : [];

  const candidates: SearchSuggestion[] = [
    ...songs.map((song) => ({
      id: song.id,
      kind: "song" as const,
      title: song.title,
      subtitle: `${song.artist}${song.album ? ` · ${song.album}` : ""}`,
      cover: song.coverSmall || song.coverMedium || song.cover,
      song,
    })),
    ...artists.map((artist) => ({
      id: artist.id,
      kind: "artist" as const,
      title: artist.name,
      subtitle: "Artist",
      cover: artist.imageSmall || artist.imageMedium || artist.image,
      artist,
    })),
    ...albums.map((album) => ({
      id: album.id,
      kind: "album" as const,
      title: album.title,
      subtitle: `${album.artist} · Album`,
      cover: album.coverSmall || album.coverMedium || album.cover,
      album,
    })),
  ];

  const ranked = candidates
    .map((c) => {
      const artist =
        c.kind === "song" ? c.song?.artist || "" :
        c.kind === "artist" ? c.artist?.name || "" :
        c.album?.artist || "";
      const score = rankCandidate(q, c.title, artist);
      return { c, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SUGGESTIONS)
    .map((entry) => entry.c);

  suggestionCache.set(q, { items: ranked, fetchedAt: Date.now() });
  return ranked;
}
