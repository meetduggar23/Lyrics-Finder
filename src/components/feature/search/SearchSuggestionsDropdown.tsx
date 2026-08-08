import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { stopPreview, playPreview } from "@/utils/audio";
import { SuggestionRow } from "@/components/feature/search/SuggestionRow";
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
