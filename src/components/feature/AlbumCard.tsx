import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { Album } from "@/types";
import { cn } from "@/utils/cn";
import { getYear } from "@/utils/format";
import { PLACEHOLDER_IMAGE } from "@/constants";
import { useFavoritesStore, albumToFavorite } from "@/store/favorites";
import { toastSuccess } from "@/store/toast";

interface AlbumCardProps {
  album: Album;
  index?: number;
}

export function AlbumCard({ album, index = 0 }: AlbumCardProps) {
  const isFavorite = useFavoritesStore((s) =>
    s.isFavorite(album.id, "album"),
  );
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(albumToFavorite(album));
    toastSuccess(
      isFavorite ? "Removed from favorites" : "Added to favorites",
      album.title,
    );
  };

  // Only Deezer albums have numeric ids that /album/:id can load.
  const href = /^\d+$/.test(album.id)
    ? `/album/${album.id}`
    : `/search?q=${encodeURIComponent(`${album.title} ${album.artist}`)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Link
        to={href}
        className="block rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
      >
        <div className="relative mb-3 overflow-hidden rounded-xl">
          <img
            src={album.coverMedium || album.cover || PLACEHOLDER_IMAGE}
            alt={album.title}
            className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <button
            onClick={handleFavorite}
            className={cn(
              "absolute bottom-2 right-2 rounded-full bg-card/90 p-2 shadow-lg backdrop-blur transition-all",
              isFavorite
                ? "text-primary"
                : "text-muted opacity-0 group-hover:opacity-100 hover:text-primary",
            )}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </button>
        </div>
        <p className="truncate text-sm font-semibold text-foreground">
          {album.title}
        </p>
        <p className="truncate text-xs text-secondary-text">{album.artist}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted">
          {getYear(album.releaseDate) && <span>{getYear(album.releaseDate)}</span>}
          {album.trackCount ? <span>· {album.trackCount} tracks</span> : null}
        </div>
      </Link>
    </motion.div>
  );
}
