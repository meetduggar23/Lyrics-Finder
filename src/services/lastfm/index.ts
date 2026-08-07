import { lastfmClient } from "@/api/client";
import type { Artist, Song, Album } from "@/types";
import { stripHtml } from "@/utils/format";

/**
 * Last.fm API service.
 * Provides artist biographies, tags, and similar artists.
 */

interface LastFmArtist {
  name: string;
  mbid?: string;
  url?: string;
  image?: { "#text": string; size: string }[];
  streamable?: string;
  listeners?: string;
  playcount?: string;
  bio?: {
    summary?: string;
    content?: string;
  };
  tags?: { tag?: { name: string }[] };
  similar?: { artist?: LastFmArtist[] };
  country?: string;
}

function getImage(images?: { "#text": string; size: string }[]): {
  large?: string;
  medium?: string;
  small?: string;
} {
  if (!images) return {};
  const pick = (size: string) =>
    images.find((i) => i.size === size)?.["#text"] || images.at(-1)?.["#text"];
  return {
    large: pick("mega") || pick("extralarge"),
    medium: pick("large"),
    small: pick("medium"),
  };
}

function mapArtist(data: LastFmArtist): Artist {
  const img = getImage(data.image);
  return {
    id: data.mbid || `lf-${data.name.toLowerCase().replace(/\s+/g, "-")}`,
    name: data.name,
    image: img.large,
    imageSmall: img.small,
    imageMedium: img.medium,
    imageLarge: img.large,
    genres: data.tags?.tag?.map((t) => t.name).slice(0, 5) ?? [],
    country: data.country,
    biography: data.bio?.content
      ? stripHtml(data.bio.content)
      : stripHtml(data.bio?.summary),
    listeners: data.listeners ? Number(data.listeners) : undefined,
    playcount: data.playcount ? Number(data.playcount) : undefined,
    source: "lastfm",
  };
}

/** Get detailed artist info including bio and similar artists */
export async function getArtistInfo(
  artistName: string,
): Promise<Artist | null> {
  try {
    const { data } = await lastfmClient.get("/", {
      params: {
        method: "artist.getinfo",
        artist: artistName,
        autocorrect: 1,
      },
    });
    const artist = data?.artist as LastFmArtist;
    if (!artist) return null;
    return mapArtist(artist);
  } catch {
    return null;
  }
}

/** Get an array of similar artists */
export async function getSimilarArtists(
  artistName: string,
  limit = 8,
): Promise<Artist[]> {
  try {
    const { data } = await lastfmClient.get("/", {
      params: {
        method: "artist.getsimilar",
        artist: artistName,
        limit,
      },
    });
    const list = data?.similarartists?.artist as LastFmArtist[] | undefined;
    return (list ?? []).map((a) => ({
      id: a.mbid || `lf-${a.name.toLowerCase().replace(/\s+/g, "-")}`,
      name: a.name,
      image: getImage(a.image).medium,
      imageMedium: getImage(a.image).medium,
      source: "lastfm" as const,
    }));
  } catch {
    return [];
  }
}

/** Get top tracks for an artist */
export async function getArtistTopTracks(
  artistName: string,
  limit = 10,
): Promise<Song[]> {
  try {
    const { data } = await lastfmClient.get("/", {
      params: {
        method: "artist.gettoptracks",
        artist: artistName,
        limit,
      },
    });
    const tracks = data?.toptracks?.track as
      | { name: string; duration?: string; listeners?: string; mbid?: string }[]
      | undefined;
    return (tracks ?? []).map((t) => ({
      id: t.mbid || `lf-${t.name.toLowerCase().replace(/\s+/g, "-")}`,
      title: t.name,
      artist: artistName,
      duration: t.duration ? Number(t.duration) : undefined,
      source: "lastfm",
    }));
  } catch {
    return [];
  }
}

/** Get top albums for an artist */
export async function getArtistTopAlbums(
  artistName: string,
  limit = 8,
): Promise<Album[]> {
  try {
    const { data } = await lastfmClient.get("/", {
      params: {
        method: "artist.gettopalbums",
        artist: artistName,
        limit,
      },
    });
    const albums = data?.topalbums?.album as
      | {
          name: string;
          mbid?: string;
          artist: { name: string };
          image?: { "#text": string; size: string }[];
        }[]
      | undefined;
    return (albums ?? []).map((a) => ({
      id: a.mbid || `lf-${a.name.toLowerCase().replace(/\s+/g, "-")}`,
      title: a.name,
      artist: a.artist?.name,
      cover: getImage(a.image).medium,
      coverMedium: getImage(a.image).medium,
      coverLarge: getImage(a.image).large,
      source: "lastfm",
    }));
  } catch {
    return [];
  }
}
