import { useState, useEffect } from "react";
import { searchAll as itunesSearchAll } from "@/services/music/itunesService";
import { searchAll as deezerSearchAll } from "@/services/deezer";
import type { SearchResults } from "@/types";

/**
 * Full search results hook for the search page.
 */
export function useSearchResults(query: string) {
  const [results, setResults] = useState<SearchResults>({
    songs: [],
    artists: [],
    albums: [],
    totalResults: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ songs: [], artists: [], albums: [], totalResults: 0 });
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const execute = async () => {
      try {
        const data = await itunesSearchAll(query);
        if (!cancelled) setResults(data);
      } catch {
        if (!cancelled) {
          try {
            const fallback = await deezerSearchAll(query);
            if (!cancelled) {
              setResults({
                ...fallback,
                totalResults:
                  fallback.songs.length +
                  fallback.artists.length +
                  fallback.albums.length,
              });
            }
          } catch {
            if (!cancelled) setError("Failed to load search results.");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    execute();
    return () => {
      cancelled = true;
    };
  }, [query]);

  return { results, loading, error };
}
