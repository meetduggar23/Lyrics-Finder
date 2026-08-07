import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ChevronRight, Sparkles } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useLiveSearch } from "@/hooks/useSearch";
import { getCharts, getRandomSongs } from "@/services/deezer";
import type { Song } from "@/types";
import { SongCard } from "@/components/feature/SongCard";
import { ArtistCard } from "@/components/feature/ArtistCard";
import { AlbumCard } from "@/components/feature/AlbumCard";
import { SectionHeader } from "@/components/feature/SectionHeader";
import { CardGridSkeleton } from "@/components/feature/Loaders";
import { getTrendingArtists } from "@/services/lastfm";
import { searchAll as itunesSearchAll } from "@/services/itunes";
import { APP_TAGLINE } from "@/constants";

const featuredGenres = [
  { label: "Pop", emoji: "🎤" },
  { label: "Rock", emoji: "🎸" },
  { label: "Hip-Hop", emoji: "🎧" },
  { label: "Electronic", emoji: "🎹" },
  { label: "Jazz", emoji: "🎷" },
  { label: "R&B", emoji: "💜" },
];

export function Home() {
  useDocumentTitle();
  const navigate = useNavigate();
  const { setQuery } = useLiveSearch();
  const [charts, setCharts] = useState<Song[]>([]);
  const [random, setRandom] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [chartData, randomData, trendingArtists] = await Promise.allSettled([
          getCharts(10),
          getRandomSongs(10),
          getTrendingArtists(8),
        ]);
        if (cancelled) return;
        setCharts(chartData.status === "fulfilled" ? chartData.value : []);
        setRandom(randomData.status === "fulfilled" ? randomData.value : []);
        setArtists(trendingArtists.status === "fulfilled" ? trendingArtists.value : []);
        // Fallback albums via iTunes
        try {
          const it = await itunesSearchAll("album");
          if (!cancelled) setAlbums(it.albums.slice(0, 8));
        } catch {
          /* ignore */
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGenreClick = (genre: string) => {
    setQuery(genre);
    navigate(`/search?q=${encodeURIComponent(genre)}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Hero */}
      <section className="relative mb-12 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/20 via-card to-card p-8 sm:p-14">
        <div className="bg-grid absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Lyrics Discovery
            </div>
            <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-tight text-foreground sm:text-5xl">
              Discover Lyrics.{" "}
              <span className="text-gradient-green">Explore Artists.</span>{" "}
              Feel the Music.
            </h1>
            <p className="mt-4 max-w-xl text-secondary-text sm:text-lg">
              {APP_TAGLINE} Search across millions of songs, artists, and
              albums with instant lyrics.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/search?q=trending")}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-black shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
              >
                <Search className="h-5 w-5" />
                Start Searching
              </button>
              <button
                onClick={() => navigate("/discover")}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card/50 px-6 font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                Explore Discover
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Genre quick filters */}
      <div className="mb-12 flex flex-wrap gap-2">
        {featuredGenres.map((g) => (
          <button
            key={g.label}
            onClick={() => handleGenreClick(g.label)}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-secondary-text transition-all hover:border-primary/40 hover:text-primary"
          >
            <span className="mr-1.5">{g.emoji}</span>
            {g.label}
          </button>
        ))}
      </div>

      {/* Trending songs */}
      <section className="mb-12">
        <SectionHeader
          title="Trending Now"
          subtitle="Top tracks around the world"
          viewAllLink="/discover"
        />
        {loading ? (
          <CardGridSkeleton count={10} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {charts.map((song, i) => (
              <SongCard key={song.id} song={song} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Artists */}
      {artists.length > 0 && (
        <section className="mb-12">
          <SectionHeader
            title="Top Artists"
            subtitle="Most listened this week"
            viewAllLink="/discover?tab=artists"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {artists.map((artist, i) => (
              <ArtistCard key={artist.id} artist={artist} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <section className="mb-12">
          <SectionHeader
            title="New Albums"
            subtitle="Fresh releases to explore"
            viewAllLink="/discover?tab=albums"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {albums.map((album, i) => (
              <AlbumCard key={album.id} album={album} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Random picks */}
      {random.length > 0 && (
        <section>
          <SectionHeader
            title="Random Picks"
            subtitle="Surprise me with great music"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {random.map((song, i) => (
              <SongCard key={song.id} song={song} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
