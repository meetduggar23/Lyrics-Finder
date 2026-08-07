import { itunesClient } from "@/api/client";
import type { Song, Album, Artist, Track } from "@/types";

/**
 * iTunes Search API service.
 * Provides fallback music metadata and 30-second previews.
 */

interface ITunesResult {
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
  trackTimeMillis?: number;
  previewUrl?: string;
  releaseDate?: string;
  primaryGenreName?: string;
  country?: string;
  trackCount?: number;
  trackNumber?: number;
  collectionViewUrl?: string;
  trackViewUrl?: string;
}

function mapSong(r: ITunesResult): Song {
  return {
    id: `it-${r.trackId}`,
    title: r.trackName,
    artist: r.artistName,
    artistId: `it-artist-${r.artistId}`,
    album: r.collectionName,
    albumId: `it-album-${r.collectionId}`,
    cover: r.artworkUrl100,
    coverSmall: r.artworkUrl60,
    coverMedium: r.artworkUrl100,
    coverLarge: r.artworkUrl100?.replace("100x100", "300x300"),
    duration: r.trackTimeMillis ? Math.round(r.trackTimeMillis / 1000) : undefined,
    previewUrl: r.previewUrl,
    link: r.trackViewUrl,
    releaseYear: r.releaseDate
      ? new Date(r.releaseDate).getFullYear()
      : undefined,
    source: "itunes",
  };
}

function mapAlbum(r: ITunesResult): Album {
  return {
    id: `it-album-${r.collectionId}`,
    title: r.collectionName,
    artist: r.artistName,
    artistId: `it-artist-${r.artistId}`,
    cover: r.artworkUrl100,
    coverSmall: r.artworkUrl60,
    coverMedium: r.artworkUrl100,
    coverLarge: r.artworkUrl100?.replace("100x100", "300x300"),
    releaseDate: r.releaseDate,
    genre: r.primaryGenreName,
    trackCount: r.trackCount,
    source: "itunes",
  };
}

function mapArtist(r: ITunesResult): Artist {
  return {
    id: `it-artist-${r.artistId}`,
    name: r.artistName,
    image: r.artworkUrl100,
    imageSmall: r.artworkUrl60,
    imageMedium: r.artworkUrl100,
    imageLarge: r.artworkUrl100?.replace("100x100", "300x300"),
    genres: r.primaryGenreName ? [r.primaryGenreName] : [],
    country: r.country,
    source: "itunes",
  };
}

/** Search songs via iTunes */
export async function searchSongs(
  query: string,
  limit = 20,
): Promise<Song[]> {
  const { data } = await itunesClient.get("/search", {
    params: { term: query, entity: "song", limit },
  });
  const results: ITunesResult[] = data?.results ?? [];
  return results.filter((r) => r.kind === "song").map(mapSong);
}

/** Search albums via iTunes */
export async function searchAlbums(
  query: string,
  limit = 10,
): Promise<Album[]> {
  const { data } = await itunesClient.get("/search", {
    params: { term: query, entity: "album", limit },
  });
  const results: ITunesResult[] = data?.results ?? [];
  return results.filter((r) => r.wrapperType === "collection").map(mapAlbum);
}

/** Search artists via iTunes */
export async function searchArtists(
  query: string,
  limit = 10,
): Promise<Artist[]> {
  const { data } = await itunesClient.get("/search", {
    params: { term: query, entity: "musicArtist", limit },
  });
  const results: ITunesResult[] = data?.results ?? [];
  return results.filter((r) => r.wrapperType === "artist").map(mapArtist);
}

/** Combine searches into unified results */
export async function searchAll(query: string): Promise<{
  songs: Song[];
  artists: Artist[];
  albums: Album[];
}> {
  const [songs, artists, albums] = await Promise.allSettled([
    searchSongs(query),
    searchArtists(query),
    searchAlbums(query),
  ]);
  return {
    songs: songs.status === "fulfilled" ? songs.value : [],
    artists: artists.status === "fulfilled" ? artists.value : [],
    albums: albums.status === "fulfilled" ? albums.value : [],
  };
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
