import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Users, PlaySquare } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { searchArtists } from "@/services/deezer";
import { getArtistInfo, getSimilarArtists, getArtistTopTracks, getArtistTopAlbums } from "@/services/lastfm";
import type { Artist as ArtistType, Song, Album } from "@/types";
import { PLACEHOLDER_IMAGE } from "@/constants";
import { formatNumber } from "@/utils/format";
import { useFavoritesStore, artistToFavorite } from "@/store/favorites";
import { useHistoryStore } from "@/store/history";
import { SongCard } from "@/components/feature/SongCard";
import { AlbumCard } from "@/components/feature/AlbumCard";
import { ArtistCard } from "@/components/feature/ArtistCard";
import { SectionHeader } from "@/components/feature/SectionHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/error-state";
import { toastSuccess } from "@/store/toast";
import { cn } from "@/utils/cn";

export function ArtistPage() {
  const { name } = useParams<{ name: string }>();
  const decodedName = name || "";
  const [artist, setArtist] = useState<ArtistType | null>(null);
  const [similar, setSimilar] = useState<ArtistType[]>([]);
  const [tracks, setTracks] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isFavorite = useFavoritesStore((s) =>
    s.isFavorite(artist?.id || decodedName, "artist"),
  );
const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const addHistory = useHistoryStore((s) => s.addItem);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      if (!decodedName) {
        setError("Artist not found.");
        setLoading(false);
        return;
      }
      try {
        const [info, similarArtists] = await Promise.allSettled([
          getArtistInfo(decodedName),
          getSimilarArtists(decodedName),
        ]);
        if (cancelled) return;

        let artistData: ArtistType | null =
          info.status === "fulfilled" ? info.value : null;

        // If Last.fm has no image, try Deezer for a photo
        if (!artistData || !artistData.image) {
          try {
            const deezerArtists = await searchArtists(decodedName, 1);
            if (deezerArtists.length > 0) {
              const d = deezerArtists[0];
              artistData = {
                ...(artistData || { id: decodedName, name: decodedName }),
                image: d.image,
                imageSmall: d.imageSmall,
                imageMedium: d.imageMedium,
                imageLarge: d.imageLarge,
              };
            }
          } catch {
            /* ignore */
          }
        }

        if (!artistData) {
          artistData = { id: decodedName, name: decodedName, source: "lastfm" };
        }

        setArtist(artistData);
        addHistory({
          id: `artist-${artistData.id}`,
          type: "artist",
          title: artistData.name,
          subtitle: artistData.genres?.[0],
          image: artistData.image,
          data: artistData,
        });

        setSimilar(similarArtists.status === "fulfilled" ? similarArtists.value : []);

        // Load top tracks + albums (fallback to Deezer if Last.fm empty)
        const [topTracks, topAlbums] = await Promise.allSettled([
          getArtistTopTracks(decodedName),
          getArtistTopAlbums(decodedName),
        ]);
        if (cancelled) return;
        setTracks(topTracks.status === "fulfilled" ? topTracks.value.slice(0, 10) : []);
        setAlbums(topAlbums.status === "fulfilled" ? topAlbums.value.slice(0, 8) : []);
      } catch {
        if (!cancelled) setError("Failed to load artist.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [decodedName, addHistory]);

  useDocumentTitle(artist ? artist.name : "Artist");

  const handleFavorite = () => {
    if (!artist) return;
    toggleFavorite(artistToFavorite(artist));
    toastSuccess(
      isFavorite ? "Removed from favorites" : "Added to favorites",
      artist.name,
    );
  };

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <ErrorState title="Artist not found" message={error} />
      </div>
    );
  }

  if (loading || !artist) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-pulse">
        <div className="mb-8 flex items-center gap-6">
          <div className="h-40 w-40 rounded-full bg-border/50" />
          <div className="flex-1 space-y-3">
            <div className="h-10 w-64 bg-border/50 rounded" />
            <div className="h-4 w-40 bg-border/50 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-border/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left"
      >
        <img
          src={artist.imageLarge || artist.imageMedium || artist.image || PLACEHOLDER_IMAGE}
          alt={artist.name}
          className="h-40 w-40 shrink-0 rounded-full object-cover shadow-2xl ring-2 ring-border sm:h-48 sm:w-48"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            {artist.genres?.slice(0, 3).map((g) => (
              <Badge key={g} variant="secondary">{g}</Badge>
            ))}
            {artist.country && <Badge variant="outline">{artist.country}</Badge>}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
            {artist.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-secondary-text sm:justify-start">
            {artist.listeners ? (
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                {formatNumber(artist.listeners)} listeners
              </span>
            ) : null}
            {artist.playcount ? (
              <span className="flex items-center gap-1.5">
                <PlaySquare className="h-4 w-4 text-primary" />
                {formatNumber(artist.playcount)} plays
              </span>
            ) : null}
          </div>
          <div className="mt-4 flex items-center justify-center gap-3 sm:justify-start">
            <Button variant="outline" onClick={handleFavorite}>
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current text-primary")} />
              {isFavorite ? "Favorited" : "Favorite"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Biography */}
      {artist.biography && (
        <section className="mb-10">
          <SectionHeader title="About" />
          <p className="max-w-3xl text-sm leading-relaxed text-secondary-text sm:text-base">
            {artist.biography.length > 400
              ? `${artist.biography.slice(0, 600)}…`
              : artist.biography}
          </p>
        </section>
      )}

      {/* Top tracks */}
      {tracks.length > 0 && (
        <section className="mb-10">
          <SectionHeader title="Top Tracks" viewAllLink={`/search?q=${encodeURIComponent(artist.name)}`} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {tracks.map((song, i) => (
              <SongCard
                key={`${song.id}-${i}`}
                song={{ ...song, artist: artist.name, cover: song.cover || artist.image }}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <section className="mb-10">
          <SectionHeader title="Top Albums" viewAllLink={`/search?q=${encodeURIComponent(artist.name)}`} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {albums.map((album, i) => (
              <AlbumCard key={`${album.id}-${i}`} album={{ ...album, cover: album.cover || artist.image }} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Similar artists */}
      {similar.length > 0 && (
        <section>
          <SectionHeader title="Similar Artists" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {similar.map((a, i) => (
              <ArtistCard key={`${a.id}-${i}`} artist={{ ...a, image: a.image || artist.image }} index={i} />
            ))}
          </div>
        </section>
      )}

      {!tracks.length && !albums.length && !similar.length && (
        <p className="text-center text-secondary-text">No additional content available for this artist.</p>
      )}
    </div>
  );
}
