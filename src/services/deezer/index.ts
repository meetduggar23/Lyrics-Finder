import { deezerClient } from "@/api/client";
import type { Song, Artist, Album, SearchResults } from "@/types";

/**
 * Deezer API service for music metadata.
 * Provides search, song, artist, and album data.
 */

interface DeezerTrack {
  id: number;
  title: string;
  title_short: string;
  duration: number;
  preview: string;
  link: string;
  rank: number;
  artist: { id: number; name: string; picture_small?: string };
  album: {
    id: number;
    title: string;
    cover_small?: string;
    cover_medium?: string;
    cover_big?: string;
  };
  release_date?: string;
}

interface DeezerAlbum {
  id: number;
  title: string;
  cover_small?: string;
  cover_medium?: string;
  cover_big?: string;
  release_date?: string;
  genre_id?: number;
  nb_tracks?: number;
  duration?: number;
  artist: { id: number; name: string };
}

interface DeezerArtist {
  id: number;
  name: string;
  picture_small?: string;
  picture_medium?: string;
  picture_big?: string;
  nb_fan?: number;
}

function mapTrack(t: DeezerTrack): Song {
  return {
    id: String(t.id),
    title: t.title_short || t.title,
    artist: t.artist.name,
    artistId: String(t.artist.id),
    album: t.album.title,
    albumId: String(t.album.id),
    cover: t.album.cover_medium,
    coverSmall: t.album.cover_small,
    coverMedium: t.album.cover_medium,
    coverLarge: t.album.cover_big,
    duration: t.duration,
    previewUrl: t.preview,
    link: t.link,
    releaseYear: t.release_date
      ? new Date(t.release_date).getFullYear()
      : undefined,
    source: "deezer",
  };
}

function mapAlbum(a: DeezerAlbum): Album {
  return {
    id: String(a.id),
    title: a.title,
    artist: a.artist.name,
    artistId: String(a.artist.id),
    cover: a.cover_medium,
    coverSmall: a.cover_small,
    coverMedium: a.cover_medium,
    coverLarge: a.cover_big,
    releaseDate: a.release_date,
    trackCount: a.nb_tracks,
    duration: a.duration,
    source: "deezer",
  };
}

function mapArtist(a: DeezerArtist): Artist {
  return {
    id: String(a.id),
    name: a.name,
    image: a.picture_medium,
    imageSmall: a.picture_small,
    imageMedium: a.picture_medium,
    imageLarge: a.picture_big,
    listeners: a.nb_fan,
    source: "deezer",
  };
}

/** Search across songs, artists, and albums */
export async function searchAll(query: string): Promise<SearchResults> {
  const [songRes, artistRes, albumRes] = await Promise.allSettled([
    deezerClient.get("/search", { params: { q: query, limit: 12 } }),
    deezerClient.get("/search/artist", { params: { q: query, limit: 6 } }),
    deezerClient.get("/search/album", { params: { q: query, limit: 6 } }),
  ]);

  const songs =
    songRes.status === "fulfilled"
      ? songRes.value.data?.data?.map(mapTrack) ?? []
      : [];
  const artists =
    artistRes.status === "fulfilled"
      ? artistRes.value.data?.data?.map(mapArtist) ?? []
      : [];
  const albums =
    albumRes.status === "fulfilled"
      ? albumRes.value.data?.data?.map(mapAlbum) ?? []
      : [];

  return {
    songs,
    artists,
    albums,
    totalResults: songs.length + artists.length + albums.length,
  };
}

/** Search for songs only */
export async function searchSongs(query: string, limit = 20): Promise<Song[]> {
  const { data } = await deezerClient.get("/search", {
    params: { q: query, limit },
  });
  return (data?.data ?? []).map(mapTrack);
}

/** Search for artists only */
export async function searchArtists(
  query: string,
  limit = 10,
): Promise<Artist[]> {
  const { data } = await deezerClient.get("/search/artist", {
    params: { q: query, limit },
  });
  return (data?.data ?? []).map(mapArtist);
}

/** Search for albums only */
export async function searchAlbums(
  query: string,
  limit = 10,
): Promise<Album[]> {
  const { data } = await deezerClient.get("/search/album", {
    params: { q: query, limit },
  });
  return (data?.data ?? []).map(mapAlbum);
}

/** Get a single song by ID */
export async function getSong(id: string): Promise<Song | null> {
  try {
    const { data } = await deezerClient.get<DeezerTrack>(`/track/${id}`);
    return mapTrack(data);
  } catch {
    return null;
  }
}

/** Get tracks by an artist */
export async function getArtistTopTracks(
  artistId: string,
  limit = 10,
): Promise<Song[]> {
  try {
    const { data } = await deezerClient.get(`/artist/${artistId}/top`, {
      params: { limit },
    });
    return (data?.data ?? []).map(mapTrack);
  } catch {
    return [];
  }
}

/** Get albums by an artist */
export async function getArtistAlbums(
  artistId: string,
  limit = 12,
): Promise<Album[]> {
  try {
    const { data } = await deezerClient.get(`/artist/${artistId}/albums`, {
      params: { limit },
    });
    return (data?.data ?? []).map(mapAlbum);
  } catch {
    return [];
  }
}

/** Get a single artist by ID */
export async function getArtist(id: string): Promise<Artist | null> {
  try {
    const { data } = await deezerClient.get<DeezerArtist>(`/artist/${id}`);
    return mapArtist(data);
  } catch {
    return null;
  }
}

/** Get a single album by ID */
export async function getAlbum(id: string): Promise<Album | null> {
  try {
    const { data } = await deezerClient.get<any>(`/album/${id}`);
    return {
      id: String(data.id),
      title: data.title,
      artist: data.artist?.name,
      artistId: String(data.artist?.id ?? ""),
      cover: data.cover_medium,
      coverSmall: data.cover_small,
      coverMedium: data.cover_medium,
      coverLarge: data.cover_big,
      releaseDate: data.release_date,
      genre: data.genres?.data?.[0]?.name,
      label: data.label,
      trackCount: data.nb_tracks,
      duration: data.duration,
      tracks: (data.tracks?.data ?? []).map(
        (t: any, index: number): any => ({
          id: String(t.id),
          title: t.title,
          artist: data.artist?.name,
          duration: t.duration,
          trackNumber: index + 1,
          previewUrl: t.preview,
        }),
      ),
      source: "deezer",
    };
  } catch {
    return null;
  }
}

/** Get trending/chart songs */
export async function getCharts(limit = 20): Promise<Song[]> {
  try {
    const { data } = await deezerClient.get("/chart/0/tracks", {
      params: { limit },
    });
    return (data?.data ?? []).map(mapTrack);
  } catch {
    return [];
  }
}

/** Get random songs for discovery */
export async function getRandomSongs(limit = 12): Promise<Song[]> {
  try {
    const queries = ["pop 2024", "rock", "electronic", "hip hop", "jazz"];
    const q = queries[Math.floor(Math.random() * queries.length)];
    const { data } = await deezerClient.get("/search", {
      params: { q, limit, order: "RANDOM" },
    });
    return (data?.data ?? []).map(mapTrack);
  } catch {
    return [];
  }
}
