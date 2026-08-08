import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { Hero } from "@/components/feature/hero/Hero";
import { HowItWorks } from "@/components/feature/landing/HowItWorks";
import { FeaturesSection } from "@/components/feature/landing/FeaturesSection";
import { SearchSuggestionsDropdown } from "@/components/feature/search/SearchSuggestionsDropdown";
import type { SearchSuggestion } from "@/types";

const isNumericId = (id?: string) => /^\d+$/.test(id || "");

export function Home() {
  useDocumentTitle();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { suggestions, isLoading, clearSuggestions } =
    useSearchSuggestions(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setDropdownOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
    setActiveIndex(-1);
  };

  /** Open the song/artist/album page (or fall back to full search). */
  const selectSuggestion = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.title);
    setDropdownOpen(false);
    setActiveIndex(-1);
    clearSuggestions();

    if (suggestion.kind === "song" && suggestion.song) {
      navigate(`/song/${suggestion.song.id}`);
    } else if (suggestion.kind === "artist" && suggestion.artist?.name) {
      navigate(`/artist/${encodeURIComponent(suggestion.artist.name)}`);
    } else if (suggestion.kind === "album" && suggestion.album) {
      if (isNumericId(suggestion.album.id)) {
        navigate(`/album/${suggestion.album.id}`);
      } else {
        navigate(
          `/search?q=${encodeURIComponent(
            `${suggestion.album.title} ${suggestion.album.artist}`,
          )}`,
        );
      }
    } else {
      navigate(`/search?q=${encodeURIComponent(suggestion.title)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        selectSuggestion(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeDropdown();
    }
  };

  return (
    <div className="pb-10">
      <Hero />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Manual search */}
        <section id="manual-search" className="mt-12 scroll-mt-24">
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto flex max-w-[760px] items-center gap-3"
          >
            <div className="group relative flex-1">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/80 transition-colors group-focus-within:text-primary" />
              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveIndex(-1);
                  setDropdownOpen(e.target.value.trim().length >= 2);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2 && suggestions.length > 0) {
                    setDropdownOpen(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search by song title or artist…"
                className="h-14 w-full rounded-2xl border border-border bg-white/70 pl-12 pr-5 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md transition-all placeholder:text-muted hover:border-border focus:border-primary/50 focus:shadow-[0_0_0_4px_rgba(29,69,51,0.12),inset_0_1px_0_rgba(255,255,255,0.7)] focus:outline-none focus:placeholder:text-foreground/60"
                autoComplete="off"
                spellCheck={false}
              />
              <SearchSuggestionsDropdown
                open={dropdownOpen}
                suggestions={suggestions}
                isLoading={isLoading}
                activeIndex={activeIndex}
                onSelect={selectSuggestion}
                onActiveIndexChange={setActiveIndex}
                onClose={closeDropdown}
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-14 shrink-0 items-center rounded-2xl bg-primary px-8 font-semibold text-[#F7EAE0] shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover hover:shadow-primary/30 active:scale-95"
            >
              Search
            </button>
          </form>
        </section>
      </div>

      <HowItWorks />
      <FeaturesSection />
    </div>
  );
}
