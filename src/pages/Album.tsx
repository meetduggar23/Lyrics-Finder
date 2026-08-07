import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Pause, Heart, Clock, Disc3 } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getAlbum } from "@/services/deezer";
import type { Album as AlbumType, Track } from "@/types";
import { PLACEHOLDER_IMAGE } from "@/constants";
import { formatDuration, formatDate } from "@/utils/format";
import { useFavoritesStore, albumToFavorite } from "@/store/favorites";
import { useHistoryStore } from "@/store/history";
import { usePlayerStore } from "@/store/player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/error-state";
import { toastSuccess } from "@/store/toast";
import { cn } from "@/utils/cn";

export function AlbumPage() {
const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<AlbumType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isFavorite = useFavoritesStore((s) =>
    s.isFavorite(id || "", "album"),
  );
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const addHistory = useHistoryStore((s) => s.addItem);
  const playSong = usePlayerStore((s) => s.playSong);
  const current = usePlayerStore((s) => s.current);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      if (!id) return;
      const data = await getAlbum(id);
      if (cancelled) return;
      if (!data) {
        setError("Album not found.");
        setLoading(false);
        return;
      }
      setAlbum(data);
      setLoading(false);
      addHistory({
        id: `album-${data.id}`,
        type: "album",
        title: data.title,
        subtitle: data.artist,
        image: data.cover,
        data,
      });
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, addHistory]);

  useDocumentTitle(album ? `${album.title} — ${album.artist}` : "Album");

const handleTrackPlay = (track: Track, _index: number) => {
    playSong({
      title: track.title,
      artist: album?.artist || "",
      cover: album?.cover || PLACEHOLDER_IMAGE,
      previewUrl: track.previewUrl || "",
      duration: track.duration || 30,
    });
  };

  const handleFavorite = () => {
    if (!album) return;
    toggleFavorite(albumToFavorite(album));
    toastSuccess(
      isFavorite ? "Removed from favorites" : "Added to favorites",
      album.title,
    );
  };

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <ErrorState title="Album not found" message={error} />
      </div>
    );
  }

  if (loading || !album) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 animate-pulse">
        <div className="mb-8 flex items-center gap-6">
          <div className="h-48 w-48 rounded-2xl bg-border/50" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-2/3 bg-border/50 rounded" />
            <div className="h-4 w-1/3 bg-border/50 rounded" />
            <div className="h-4 w-1/4 bg-border/50 rounded" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-border/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end"
      >
        <img
          src={album.coverLarge || album.coverMedium || album.cover || PLACEHOLDER_IMAGE}
          alt={album.title}
          className="h-40 w-40 shrink-0 rounded-2xl object-cover shadow-2xl sm:h-48 sm:w-48"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary">Album</Badge>
            {album.genre && <Badge variant="outline">{album.genre}</Badge>}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
            {album.title}
          </h1>
          <p className="mt-2 text-lg text-secondary-text">
            by{" "}
            <Link
              to={`/artist/${encodeURIComponent(album.artist)}`}
              className="text-primary hover:underline"
            >
              {album.artist}
            </Link>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
            {album.releaseDate && <span>{formatDate(album.releaseDate)}</span>}
            {album.trackCount ? <span>· {album.trackCount} tracks</span> : null}
            {album.duration ? <span>· {formatDuration(album.duration)}</span> : null}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button variant="outline" onClick={handleFavorite}>
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current text-primary")} />
              {isFavorite ? "Favorited" : "Favorite"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Track list */}
      {album.tracks && album.tracks.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="overflow-hidden rounded-2xl border border-border bg-card/50"
        >
          {album.tracks.map((track, i) => {
            const isCurrentTrack =
              current?.title === track.title && current?.artist === album.artist;
            const isPlayingThis = isCurrentTrack && isPlaying;
            return (
              <div
                key={track.id}
                className={cn(
                  "group flex items-center gap-4 border-b border-border/50 px-4 py-3 transition-colors last:border-0 hover:bg-card",
                )}
              >
                <button
                  onClick={() =>
                    isCurrentTrack
                      ? togglePlay()
                      : handleTrackPlay(track, i)
                  }
                  disabled={!track.previewUrl}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-secondary-text transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30"
                  aria-label={isPlayingThis ? "Pause" : "Play"}
                >
                  {isPlayingThis ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </button>
                <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted">
                  {track.trackNumber || i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-sm font-medium", isCurrentTrack ? "text-primary" : "text-foreground")}>
                    {track.title}
                  </p>
                </div>
                <span className="flex items-center gap-1.5 text-xs tabular-nums text-muted">
                  <Clock className="h-3 w-3" />
                  {formatDuration(track.duration)}
                </span>
              </div>
            );
          })}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <Disc3 className="mb-4 h-12 w-12 text-muted" />
          <p className="text-secondary-text">No tracklist available for this album.</p>
        </div>
      )}
    </div>
  );
}
