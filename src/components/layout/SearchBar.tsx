import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, X, TrendingUp } from "lucide-react";
import { useUI } from "@/context/useUI";
import { useLiveSearch } from "@/hooks/useSearch";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { cn } from "@/utils/cn";
import { PLACEHOLDER_IMAGE } from "@/constants";

export function SearchBar() {
  const { searchOpen, closeSearch } = useUI();
  const navigate = useNavigate();
  const { query, setQuery, suggestions, isSearching, clearSearch } =
    useLiveSearch();
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectSuggestion = (title: string, artist?: string) => {
    closeSearch();
    navigate(`/search?q=${encodeURIComponent(`${title}${artist ? ` ${artist}` : ""}`)}`);
    clearSearch();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    closeSearch();
    navigate(`/search?q=${encodeURIComponent(query)}`);
    clearSearch();
  };

  useKeyboardNavigation({
    items: suggestions,
    activeIndex,
    onActiveChange: setActiveIndex,
    onSelect: (item) => selectSuggestion(item.title, item.artist),
    enabled: searchOpen && suggestions.length > 0,
  });

  if (!searchOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[110] flex items-start justify-center p-4 pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeSearch}
        aria-hidden="true"
      />
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <form onSubmit={handleSubmit} className="group flex items-center gap-3 border-b border-border p-4">
          <Search className="h-4 w-4 shrink-0 text-muted/80 transition-colors group-focus-within:text-primary" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            placeholder="Search songs, artists, albums…"
            className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted focus:outline-none"
            aria-label="Search"
          />
          {isSearching && (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
          )}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveIndex(-1);
              }}
              className="text-secondary-text hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={closeSearch}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-secondary-text hover:text-foreground"
          >
            ESC
          </button>
        </form>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!query && (
            <div className="flex items-center gap-3 p-4 text-sm text-secondary-text">
              <TrendingUp className="h-4 w-4 text-primary" />
              Type to search across songs, artists, and albums.
            </div>
          )}

          {query && suggestions.length === 0 && !isSearching && (
            <div className="p-4 text-sm text-secondary-text">
              No results for “{query}”. Press Enter to search all.
            </div>
          )}

          {suggestions.map((s, i) => (
            <button
              key={s.id}
              onClick={() => selectSuggestion(s.title, s.artist)}
              onMouseEnter={() => setActiveIndex(i)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                i === activeIndex ? "bg-primary/10" : "hover:bg-card",
              )}
            >
              <img
                src={s.coverSmall || PLACEHOLDER_IMAGE}
                alt=""
                className="h-10 w-10 rounded-lg object-cover"
                loading="lazy"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {s.title}
                </p>
                <p className="truncate text-xs text-secondary-text">{s.artist}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
