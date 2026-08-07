import { useNavigate } from "react-router-dom";
import { History as HistoryIcon, Search, Music2, User, Disc3, Trash2, FileText } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useHistoryStore } from "@/store/history";
import type { HistoryItem } from "@/types";
import { useSettingsStore } from "@/store/settings";
import { useToastStore } from "@/store/toast";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

const typeConfig: Record<string, { label: string; icon: any }> = {
  search: { label: "Search", icon: Search },
  song: { label: "Song", icon: Music2 },
  artist: { label: "Artist", icon: User },
  album: { label: "Album", icon: Disc3 },
  lyrics: { label: "Lyrics", icon: FileText },
};

export function History() {
  useDocumentTitle("History");
  const navigate = useNavigate();
  const { items, clearHistory } = useHistoryStore();
  const rememberHistory = useSettingsStore((s) => s.settings.rememberHistory);

  const handleOpen = (item: HistoryItem) => {
    if (item.type === "song" && item.data) {
      navigate(`/song/${(item.data as any).id}`);
    } else if (item.type === "artist") {
      navigate(`/artist/${encodeURIComponent(item.title)}`);
    } else if (item.type === "album" && item.data) {
      navigate(`/album/${(item.data as any).id}`);
    } else if (item.type === "search") {
      navigate(`/search?q=${encodeURIComponent(item.title)}`);
    }
  };

  const handleClear = () => {
    clearHistory();
    useToastStore.getState().showToast({ type: "info", message: "History cleared." });
  };

  if (!rememberHistory) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={<HistoryIcon className="h-8 w-8 text-primary" />}
          title="History is disabled"
          description="Enable 'Remember history' in Settings to start tracking your activity."
          action={<Button onClick={() => navigate("/settings")}>Open Settings</Button>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
            <HistoryIcon className="h-7 w-7 text-primary" />
            History
          </h1>
          <p className="mt-1 text-sm text-secondary-text">
            Recently viewed songs, artists, albums, and searches.
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="destructive" size="sm" onClick={handleClear}>
            <Trash2 className="h-4 w-4" />
            Clear History
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon className="h-8 w-8 text-primary" />}
          title="No history yet"
          description="When you view songs, artists, or albums, they'll appear here."
          action={<Button onClick={() => navigate("/discover")}>Explore Music</Button>}
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const config = typeConfig[item.type] || typeConfig.search;
            const Icon = config.icon;
            return (
              <div
                key={item.id}
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
              >
                <button
                  onClick={() => handleOpen(item)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-xl object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="truncate text-xs text-secondary-text">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </button>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-border/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-secondary-text">
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </span>
                  <span className="text-[10px] text-muted">
                    {new Date(item.viewedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
