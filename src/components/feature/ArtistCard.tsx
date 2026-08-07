import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { Artist } from "@/types";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/format";
import { PLACEHOLDER_IMAGE } from "@/constants";
import { useFavoritesStore, artistToFavorite } from "@/store/favorites";
import { toastSuccess } from "@/store/toast";

interface ArtistCardProps {
  artist: Artist;
  index?: number;
}

export function ArtistCard({ artist, index = 0 }: ArtistCardProps) {
  const isFavorite = useFavoritesStore((s) =>
    s.isFavorite(artist.id, "artist"),
  );
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(artistToFavorite(artist));
    toastSuccess(
      isFavorite ? "Removed from favorites" : "Added to favorites",
      artist.name,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Link
        to={`/artist/${encodeURIComponent(artist.name)}`}
        className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/40"
      >
        <div className="relative mb-4">
          <img
            src={artist.imageMedium || artist.image || PLACEHOLDER_IMAGE}
            alt={artist.name}
            className="h-24 w-24 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/50"
            loading="lazy"
          />
          <button
            onClick={handleFavorite}
            className={cn(
              "absolute -bottom-1 -right-1 rounded-full bg-card p-1.5 shadow-lg transition-all",
              isFavorite
                ? "text-primary"
                : "text-muted opacity-0 group-hover:opacity-100 hover:text-primary",
            )}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </button>
        </div>
        <p className="w-full truncate text-sm font-semibold text-foreground">
          {artist.name}
        </p>
        {artist.listeners ? (
          <p className="mt-1 text-xs text-secondary-text">
            {formatNumber(artist.listeners)} listeners
          </p>
        ) : (
          <p className="mt-1 text-xs text-secondary-text">Artist</p>
        )}
      </Link>
    </motion.div>
  );
}
