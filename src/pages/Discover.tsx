import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Music2, User, Disc3, TrendingUp } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getCharts, getRandomSongs } from "@/services/deezer";
import { getTrendingArtists, getTrendingTracks } from "@/services/lastfm";
import type { Song, Artist } from "@/types";
import { SongCard } from "@/components/feature/SongCard";
import { ArtistCard } from "@/components/feature/ArtistCard";
import { SectionHeader } from "@/components/feature/SectionHeader";
import { CardGridSkeleton } from "@/components/feature/Loaders";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/utils/cn";

type Tab = "songs" | "artists" | "albums";

export function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get("tab") as Tab) || "songs";
  const [charts, setCharts] = useState<Song[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [random, setRandom] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useDocumentTitle("Discover");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      const [chartsData, randomData, artistsData, tracksData] =
        await Promise.allSettled([
          getCharts(15),
          getRandomSongs(15),
          getTrendingArtists(12),
          getTrendingTracks(15),
        ]);
      if (cancelled) return;
      setCharts(chartsData.status === "fulfilled" ? chartsData.value : []);
      setRandom(randomData.status === "fulfilled" ? randomData.value : []);
      setArtists(artistsData.status === "fulfilled" ? artistsData.value : []);
      setTrendingTracks(tracksData.status === "fulfilled" ? tracksData.value : []);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const setTab = (t: Tab) => {
    setSearchParams({ tab: t });
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "songs", label: "Trending Songs", icon: Music2 },
    { id: "artists", label: "Top Artists", icon: User },
    { id: "albums", label: "Discover Albums", icon: Disc3 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Discover
        </h1>
      </div>
      <p className="mb-8 text-secondary-text">
        Explore trending music, top artists, and discover new favorites.
      </p>

      {/* Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-primary text-black"
                : "border border-border bg-card text-secondary-text hover:text-foreground",
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <CardGridSkeleton count={15} />
      ) : (
        <>
          {tab === "songs" && (
            <div className="space-y-12">
              <section>
                <SectionHeader title="Global Charts" subtitle="Top tracks right now" />
                {charts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {charts.map((song, i) => (
                      <SongCard key={`${song.id}-${i}`} song={song} index={i} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No charts available" />
                )}
              </section>
              <section>
                <SectionHeader title="Trending Worldwide" subtitle="From Last.fm" />
                {trendingTracks.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {trendingTracks.map((song, i) => (
                      <SongCard key={`${song.id}-${i}`} song={song} index={i} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No trending tracks" />
                )}
              </section>
            </div>
          )}

          {tab === "artists" && (
            <section>
              <SectionHeader title="Top Artists" subtitle="Most listened globally" />
              {artists.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {artists.map((artist, i) => (
                    <ArtistCard key={`${artist.id}-${i}`} artist={artist} index={i} />
                  ))}
                </div>
              ) : (
                <EmptyState icon={<User className="h-8 w-8 text-primary" />} title="No artists found" />
              )}
            </section>
          )}

          {tab === "albums" && (
            <section>
              <SectionHeader title="Random Discoveries" subtitle="Albums from around the world" />
              {random.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {random.map((song, i) => (
                    <SongCard key={`${song.id}-${i}`} song={song} index={i} />
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Disc3 className="h-8 w-8 text-primary" />} title="No albums found" />
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
