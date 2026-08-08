import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { searchSuggestions } from "@/services/music/itunesService";
import type { SearchSuggestion } from "@/types";

/**
 * Autocomplete suggestions for the main search input.
 * - Waits ~300ms after the user stops typing before calling the API.
 * - Requires at least 2 characters.
 * - Ignores responses that arrive after the query changed (no flicker).
 * - Repeated queries are served from the service-level cache.
 */
export function useSearchSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const requestSeq = useRef(0);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 2) {
      requestSeq.current += 1;
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const seq = ++requestSeq.current;
    setIsLoading(true);

    searchSuggestions(q).then((items) => {
      if (requestSeq.current !== seq) return;
      setSuggestions(items);
      setIsLoading(false);
    });

    return () => {
      // Stale responses for this query are dropped by the seq check above.
    };
  }, [debouncedQuery]);

  const clearSuggestions = useCallback(() => {
    requestSeq.current += 1;
    setSuggestions([]);
    setIsLoading(false);
  }, []);

  return { suggestions, isLoading, clearSuggestions };
}
