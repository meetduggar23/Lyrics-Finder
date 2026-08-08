import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Music2, Search, Loader2, Play, Pause } from "lucide-react";
import { cn } from "@/utils/cn";
import { playPreview, stopPreview } from "@/utils/audio";
import { usePreviewPlayback } from "@/hooks/usePreviewPlayback";
import type { SearchSuggestion } from "@/types";

interface SearchSuggestionsDropdownProps {
  open: boolean;
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  activeIndex: number;
  onSelect: (suggestion: SearchSuggestion, index: number) => void;
  onActiveIndexChange: (index: number) => void;
  onClose: () => void;
}

/** Tiny animated equalizer shown next to the title of the playing song. */
function MiniEqualizer() {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-[2px] rounded-full bg-primary"
          animate={{ height: [3, 9, 3] }}
          transition={{
            repeat: Infinity,
            duration: 0.6,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

interface SuggestionRowProps {
  suggestion: SearchSuggestion;
  active: boolean;
  onSelect: () => void;
  onActiveChange: () => void;
  onTogglePlay: (previewUrl: string, isPlaying: boolean) => void;
}

function SuggestionRow({
  suggestion,
  active,
  onSelect,
  onActiveChange,
  onTogglePlay,
}: SuggestionRowProps) {
  const previewUrl = suggestion.song?.previewUrl;
  const { isPlaying, progress } = usePreviewPlayback(previewUrl);

  const handlePlay = (e: React.MouseEvent) => {
    // Play toggles preview only — never select the row.
    e.stopPropagation();
    e.preventDefault();
    if (!previewUrl) return;
    onTogglePlay(previewUrl, isPlaying);
  };

  const progressPct =
    progress && progress.duration > 0
      ? Math.min(100, (progress.current / progress.duration) * 100)
      : 0;

  return (
    <div
      role="button"
      tabIndex={-1}
      onMouseEnter={onActiveChange}
      onMouseDown={(e) => {
        // Fire before blur/outside-click closes the dropdown.
        e.preventDefault();
        onSelect();
      }}
      className={cn(
        "group relative flex w-full items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-left transition-colors",
        active
          ? "border-primary bg-primary/[0.07]"
          : "hover:bg-primary/[0.04]",
      )}
    >
      {suggestion.cover ? (
        <img
          src={suggestion.cover}
          alt=""
          className={cn(
            "h-10 w-10 shrink-0 rounded-lg object-cover transition-shadow",
            isPlaying &&
              "shadow-[0_0_0_2px_rgba(29,69,51,0.45),0_0_14px_rgba(29,69,51,0.35)]",
          )}
          loading="lazy"
        />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface">
          <Music2 className="h-4 w-4 text-primary/60" />
        </span>
      )}

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-center gap-1.5">
          <span
            className={cn(
              "truncate text-sm font-semibold text-foreground",
              isPlaying && "text-primary",
            )}
          >
            {suggestion.title}
          </span>
          {isPlaying && <MiniEqualizer />}
        </span>
        <span className="truncate text-xs text-secondary-text">
          {suggestion.subtitle}
        </span>
      </span>

      {/* Play / pause preview — only for songs that have a preview URL */}
      {suggestion.kind === "song" && previewUrl && (
        <button
          type="button"
          aria-label={isPlaying ? "Pause preview" : "Play preview"}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onClick={handlePlay}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-[#F7EAE0] shadow-lg shadow-primary/25 transition-all duration-200",
            "hover:bg-primary-hover hover:shadow-primary/40",
            isPlaying
              ? "opacity-100"
              : "opacity-100 md:opacity-0 md:group-hover:opacity-100",
          )}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5 fill-current" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-current" />
          )}
        </button>
      )}

      {/* Slim progress bar under the row while playing */}
      {isPlaying && (
        <span
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] overflow-hidden rounded-b-2xl bg-border"
          aria-hidden="true"
        >
          <span
            className="block h-full bg-primary transition-[width] duration-300 ease-linear"
            style={{ width: `${progressPct}%` }}
          />
        </span>
      )}
    </div>
  );
}

/**
 * Autocomplete dropdown rendered directly underneath the main search input.
 * Stays visually attached to the search bar (same width, card background,
 * subtle border + soft shadow) with a thin green accent on the active row.
 */
export function SearchSuggestionsDropdown({
  open,
  suggestions,
  isLoading,
  activeIndex,
  onSelect,
  onActiveIndexChange,
  onClose,
}: SearchSuggestionsDropdownProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const playingRef = useRef(false);

  // Close when the user clicks outside the search area.
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, onClose]);

  // Track whether a preview started from this dropdown so we can stop it
  // when the dropdown unmounts (navigating away from the search page).
  useEffect(() => {
    return () => {
      if (playingRef.current) stopPreview();
    };
  }, []);

  const handleTogglePlay = (previewUrl: string, isPlaying: boolean) => {
    if (isPlaying) {
      stopPreview();
      playingRef.current = false;
    } else {
      playPreview(previewUrl);
      playingRef.current = true;
    }
  };

  const showEmpty = open && !isLoading && suggestions.length === 0;

  return (
    <div ref={rootRef} className="relative">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_18px_50px_rgba(94,49,34,0.18)]"
          >
            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center gap-2.5 px-4 py-3 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Searching…
              </div>
            )}

            {/* Suggestions */}
            {!isLoading &&
              suggestions.map((s, i) => (
                <SuggestionRow
                  key={`${s.kind}-${s.id}`}
                  suggestion={s}
                  active={i === activeIndex}
                  onSelect={() => onSelect(s, i)}
                  onActiveChange={() => onActiveIndexChange(i)}
                  onTogglePlay={handleTogglePlay}
                />
              ))}

            {/* Empty state */}
            {showEmpty && (
              <div className="flex items-center gap-2.5 px-4 py-3 text-sm text-muted">
                <Search className="h-4 w-4" />
                No matching songs
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
