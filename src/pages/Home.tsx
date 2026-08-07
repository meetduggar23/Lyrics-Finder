import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, History as HistoryIcon, ArrowRight } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useHistoryStore } from "@/store/history";
import type { Song } from "@/types";
import { PLACEHOLDER_IMAGE } from "@/constants";
import { Hero } from "@/components/feature/hero/Hero";

export function Home() {
  useDocumentTitle();
  const navigate = useNavigate();
  const { items } = useHistoryStore();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const recentSongs = items
    .filter((i) => i.type === "song" && i.data)
    .slice(0, 8) as Array<{ id: string; title: string; subtitle?: string; image?: string; data: Song }>;

  const recentSearches = items
    .filter((i) => i.type === "search")
    .slice(0, 6);

  return (
    <div className="pb-10">
      <Hero />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Manual search */}
        <section id="manual-search" className="mt-12 scroll-mt-24">
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto flex max-w-xl items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by song title or artist…"
                className="h-13 w-full rounded-full border border-border bg-card pl-12 pr-4 text-sm text-foreground placeholder:text-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-13 shrink-0 items-center rounded-full bg-primary px-6 font-semibold text-black transition-colors hover:bg-primary-hover"
            >
              Search
            </button>
          </form>
        </section>

        {/* Recently searched songs */}
        <section className="mt-14">
          <div className="mb-5 flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Recently Searched Songs</h2>
          </div>

          {recentSongs.length === 0 && recentSearches.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card/40 p-10 text-center">
              <HistoryIcon className="mx-auto mb-3 h-8 w-8 text-muted" />
              <p className="text-secondary-text">
                Songs you search for or listen to will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSongs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.data && navigate(`/song/${item.data.id}`)}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40"
                >
                  <img
                    src={item.image || item.data.cover || PLACEHOLDER_IMAGE}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.data.title}
                    </p>
                    <p className="truncate text-xs text-secondary-text">
                      {item.data.artist}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </button>
              ))}
            </div>
          )}

          {recentSearches.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Recent Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(item.title)}`)}
                    className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-secondary-text transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
