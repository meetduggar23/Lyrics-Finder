import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { getChartTracks } from "@/services/deezer";
import type { Song } from "@/types";
import { SongCard } from "@/components/feature/SongCard";
import { SectionHeader } from "@/components/feature/SectionHeader";
import { CardGridSkeleton } from "@/components/feature/Loaders";

function useTrendingTracks() {
  const [tracks, setTracks] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getChartTracks(10)
      .then((data) => {
        if (!cancelled) setTracks(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return { tracks, loading, retry: () => setAttempt((a) => a + 1) };
}

export function TrendingSongs() {
  const { tracks, loading, retry } = useTrendingTracks();

  return (
    <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:mt-20">
      <SectionHeader
        title="Trending Now"
        subtitle="The songs the world is listening to right now."
      />

      {loading ? (
        <CardGridSkeleton count={10} />
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-border bg-card/40 px-6 py-10 text-center">
          <Flame className="mb-3 h-8 w-8 text-muted" />
          <p className="text-secondary-text">
            Couldn&apos;t load trending songs. Please try again.
          </p>
          <button
            onClick={retry}
            className="mt-4 rounded-full border border-border px-5 py-2 text-sm font-medium text-secondary-text transition-colors hover:border-primary/40 hover:text-primary"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {tracks.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </section>
  );
}
