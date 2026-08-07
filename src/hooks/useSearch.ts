import { useState, useCallback, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { searchAll as deezerSearchAll } from "@/services/deezer";
import { searchAll as itunesSearchAll } from "@/services/itunes";
import type { SearchResults, Song, Artist, Album } from "@/types";

/**
 * Live search hook with debouncing and combined API results.
 * Fetches from Deezer with iTunes fallback.
 */
export function useLiveSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 400);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    // Cancel previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timeout = setTimeout(async () => {
      try {
        const results = await deezerSearchAll(debouncedQuery);
        setSuggestions(results.songs.slice(0, 6));
      } catch {
        // Fallback to iTunes on failure
        try {
          const fallback = await itunesSearchAll(debouncedQuery);
          setSuggestions(fallback.songs.slice(0, 6));
        } catch {
          setSuggestions([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [debouncedQuery]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    isSearching,
    error,
    clearSearch,
  };
}

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
        const data = await deezerSearchAll(query);
        if (!cancelled) setResults(data);
      } catch {
        if (!cancelled) {
          try {
            const fallback = await itunesSearchAll(query);
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

export type { SearchResults, Song, Artist, Album };
