import { itunesClient } from "@/api/client";
import type { Song, Track } from "@/types";
import {
  searchSongs,
  searchArtists,
  searchAlbums,
  searchAll,
  getSongDetails,
} from "@/services/music/itunesService";

export {
  searchSongs,
  searchArtists,
  searchAlbums,
  searchAll,
  getSongDetails,
};

interface ITunesResult {
  wrapperType: string;
  kind?: string;
  trackId: number;
  trackName: string;
  artistName: string;
  trackTimeMillis?: number;
  previewUrl?: string;
  trackNumber?: number;
}

/** Normalize a string for loose matching (case + punctuation insensitive). */
function normKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Normalize an artist name for matching, stripping bracketed disambiguation. */
function normArtist(s: string): string {
  return normKey(s).replace(/\(.*\)/g, "").trim();
}

/** Hindi / Indian pool search terms (searched against the IN storefront). */
const HINDI_QUERIES = [
  "bollywood",
  "hindi hits",
  "indian pop",
  "hindi songs",
  "bollywood hits",
] as const;

/** Extra Indian queries tried only when the primary pool comes up short. */
const HINDI_EXTRA_QUERIES = [
  "arijit singh",
  "neha kakkar",
  "shreya ghoshal",
  "atif aslam",
  "punjabi hits",
] as const;

/** English / International pool search terms (searched against US/GB). */
const ENGLISH_QUERIES = [
  "pop",
  "top hits",
  "english hits",
  "rock",
  "r&b",
] as const;

/** Extra English queries tried only when the primary pool comes up short. */
const ENGLISH_EXTRA_QUERIES = [
  "ed sheeran",
  "the weeknd",
  "dua lipa",
  "alternative",
  "dance pop",
] as const;

/** Hindi searches always use the India storefront. */
const HINDI_COUNTRY = "IN";

/** English searches prefer the US storefront, falling back to GB. */
const ENGLISH_COUNTRIES = ["US", "GB"] as const;

/** Target pool size per language for the hero music cards. */
const POOL_SIZE = 15;

/** Total target size of the combined featured pool. */
const FEATURED_TARGET = 30;

/** Minimum combined songs before the pool is considered usable. */
const MIN_USABLE_SONGS = 10;

/**
 * Remove duplicates from a song list.
 * Primary key is the track id (trackId); normalized title+artist is a
 * secondary key that also catches cross-provider duplicates.
 */
export function deduplicateSongs(songs: Song[]): Song[] {
  const seen = new Set<string>();
  const out: Song[] = [];
  for (const s of songs) {
    const idKey = s.id ? `id:${s.id}` : "";
    const nameKey = `name:${normKey(s.title)}|${normArtist(s.artist)}`;
    if (idKey && seen.has(idKey)) continue;
    if (seen.has(nameKey)) continue;
    if (idKey) seen.add(idKey);
    seen.add(nameKey);
    out.push(s);
  }
  return out;
}

/** Only songs we can actually play and show (preview + artwork). */
function isUsable(song: Song): boolean {
  return Boolean(song.previewUrl) && Boolean(song.coverMedium || song.cover);
}

async function searchPool(
  queries: readonly string[],
  countries: readonly string[],
  limit: number,
): Promise<Song[]> {
  const results = await Promise.allSettled(
    queries.map((q) => searchSongs(q, limit, countries)),
  );
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

/** Build one language pool from its queries, topping up with extras if short. */
async function buildPool(
  queries: readonly string[],
  extraQueries: readonly string[],
  countries: readonly string[],
  language: "hindi" | "english",
): Promise<Song[]> {
  let songs = deduplicateSongs(
    (await searchPool(queries, countries, 25)).map((s) => ({ ...s, language })),
  ).filter(isUsable);

  if (songs.length < POOL_SIZE) {
    const extras = deduplicateSongs(
      (await searchPool(extraQueries, countries, 25)).map((s) => ({
        ...s,
        language,
      })),
    ).filter(isUsable);
    songs = deduplicateSongs([...songs, ...extras]).filter(isUsable);
  }

  return songs.slice(0, POOL_SIZE);
}

/**
 * Fetch two separate pools — Hindi/Indian (IN storefront) and
 * English/International (US/GB storefront) — then merge them in a balanced
 * ~50/50 mix for the hero cards.
 */
async function fetchFeaturedSongs(): Promise<Song[]> {
  const [hindiSongs, englishSongs] = await Promise.all([
    buildPool(HINDI_QUERIES, HINDI_EXTRA_QUERIES, [HINDI_COUNTRY], "hindi"),
    buildPool(ENGLISH_QUERIES, ENGLISH_EXTRA_QUERIES, ENGLISH_COUNTRIES, "english"),
  ]);

  const mixed: Song[] = [];
  const size = Math.max(hindiSongs.length, englishSongs.length);
  for (let i = 0; i < size; i++) {
    if (i < hindiSongs.length) mixed.push(hindiSongs[i]);
    if (i < englishSongs.length) mixed.push(englishSongs[i]);
  }
  return mixed.slice(0, FEATURED_TARGET);
}

/**
 * Fetch the mixed-language featured pool (50% Hindi / 50% English).
 * Powers the hero music cards with a varied, real playlist.
 */
export async function getFeaturedSongs(): Promise<Song[]> {
  try {
    const songs = await fetchFeaturedSongs();
    if (songs.length >= MIN_USABLE_SONGS) return songs;
  } catch {
    // Fall through to the simple search fallback below.
  }
  return searchSongs("top hits", FEATURED_TARGET);
}

/** Get album tracks */
export async function getAlbumTracks(albumId: number): Promise<Track[]> {
  // iTunes lookup endpoint returns all tracks for a collection
  const { data } = await itunesClient.get("/lookup", {
    params: { id: albumId, entity: "song" },
  });
  const results: ITunesResult[] = data?.results ?? [];
  return results
    .filter((r) => r.kind === "song")
    .map((r) => ({
      id: `it-${r.trackId}`,
      title: r.trackName,
      artist: r.artistName,
      duration: r.trackTimeMillis ? Math.round(r.trackTimeMillis / 1000) : undefined,
      trackNumber: r.trackNumber,
      previewUrl: r.previewUrl,
    }));
}
