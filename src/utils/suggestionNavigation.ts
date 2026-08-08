import type { NavigateFunction } from "react-router-dom";
import type { SearchSuggestion } from "@/types";

const isNumericId = (id?: string) => /^\d+$/.test(id || "");

/**
 * Route to the page for a selected suggestion: song details for songs,
 * artist page for artists, album page for albums (falls back to a full
 * search when the album id can't be resolved).
 */
export function navigateToSuggestion(
  navigate: NavigateFunction,
  suggestion: SearchSuggestion,
) {
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
}
