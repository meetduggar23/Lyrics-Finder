import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, Square, Search, History as HistoryIcon, TriangleAlert, ArrowRight, Sparkles } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useRecorder } from "@/hooks/useRecorder";
import { recognizeAudio, hasAuddKey } from "@/services/audd";
import { findTrack } from "@/services/deezer";
import { useHistoryStore } from "@/store/history";
import type { Song } from "@/types";
import { PLACEHOLDER_IMAGE } from "@/constants";
import { APP_TAGLINE } from "@/constants";
import { cn } from "@/utils/cn";

type Phase = "idle" | "listening" | "analyzing" | "error";

const RECORD_SECONDS = 8;
const WAVE_BARS = 32;

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-16 items-end justify-center gap-1" aria-hidden="true">
      {Array.from({ length: WAVE_BARS }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1.5 rounded-full bg-primary/80"
          animate={active ? { height: [8, 20, 48, 14, 34, 58, 10, 26][i % 8] } : { height: 6 }}
          transition={
            active
              ? {
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 0.7 + (i % 5) * 0.12,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}

export function Home() {
  useDocumentTitle();
  const navigate = useNavigate();
  const { items } = useHistoryStore();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const progressRef = useRef(0);

  const runRecognitionRef = useRef<(blob: Blob) => void>(() => {});
  runRecognitionRef.current = (blob) => {
    void runRecognition(blob);
  };

  const { seconds, error: recorderError, start, cancel } = useRecorder(
    (blob) => runRecognitionRef.current(blob),
  );

  useEffect(() => {
    if (recorderError) {
      setPhase("error");
      setError(recorderError);
    }
  }, [recorderError]);

  const runRecognition = async (blob: Blob) => {
    setPhase("analyzing");
    setError(null);
    progressRef.current = 0;
    setProgress(0);

    const timer = window.setInterval(() => {
      progressRef.current = Math.min(90, progressRef.current + Math.random() * 12);
      setProgress(Math.floor(progressRef.current));
    }, 250);

    try {
      const detected = await recognizeAudio(blob, "recording.webm");
      const song: Song | null = await findTrack(detected.title, detected.artist);
      window.clearInterval(timer);
      if (song) {
        navigate(`/song/${song.id}`);
      } else {
        navigate(
          `/search?q=${encodeURIComponent(`${detected.title} ${detected.artist}`)}`,
        );
      }
    } catch (e) {
      window.clearInterval(timer);
      setError(e instanceof Error ? e.message : "Recognition failed. Please try again.");
      setPhase("error");
    }
  };

  const handleStart = async () => {
    setError(null);
    setPhase("listening");
    await start();
  };

  const handleCancel = () => {
    cancel();
    setPhase("idle");
    setError(null);
  };

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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-surface to-card px-6 py-14 text-center sm:px-14 sm:py-20">
        <div className="bg-grid absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Song Recognition
            </div>
            <h1 className="mx-auto max-w-2xl text-4xl font-black leading-tight tracking-tight text-foreground sm:text-6xl">
              Identify Any Song{" "}
              <span className="text-gradient-green">in Seconds</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-secondary-text sm:text-lg">
              {APP_TAGLINE} Listen to any song and get its lyrics, artist and
              album instantly.
            </p>
          </motion.div>

          {/* Listen button */}
          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
              {[0, 1, 2].map((ring) => (
                <motion.span
                  key={ring}
                  className="absolute inset-0 rounded-full border border-primary/40"
                  animate={
                    phase === "listening"
                      ? { scale: [1, 1.4], opacity: [0.6, 0] }
                      : { scale: 1, opacity: 0.35 }
                  }
                  transition={
                    phase === "listening"
                      ? { repeat: Infinity, duration: 2.2, delay: ring * 0.7, ease: "easeOut" }
                      : { duration: 0.4 }
                  }
                  aria-hidden="true"
                />
              ))}
              <motion.div
                className="absolute inset-5 rounded-full border border-primary/30"
                animate={{ scale: [1, 1.06] }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.8, ease: "easeInOut" }}
                aria-hidden="true"
              />
              <button
                onClick={phase === "listening" ? handleCancel : handleStart}
                aria-label={phase === "listening" ? "Stop listening" : "Tap to listen"}
                className={cn(
                  "relative flex h-36 w-36 items-center justify-center rounded-full transition-all sm:h-40 sm:w-40",
                  phase === "listening"
                    ? "bg-error/15 text-error shadow-[0_0_60px_rgba(229,57,53,0.35)]"
                    : "bg-primary text-black shadow-[0_0_80px_var(--color-accent-glow)] hover:scale-105 hover:bg-primary-hover",
                )}
              >
                <AnimatePresence mode="wait">
                  {phase === "listening" ? (
                    <motion.div
                      key="stop"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                    >
                      <Square className="h-9 w-9 fill-current" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="mic"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="text-center"
                    >
                      <Mic className="mx-auto h-10 w-10" />
                      <span className="mt-1 block text-xs font-bold uppercase tracking-wide">
                        Tap to Listen
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>

            <div className="flex min-h-16 flex-col items-center justify-center">
              {phase === "idle" && (
                <p className="max-w-sm text-sm text-secondary-text">
                  Tap the button and play a song near you — listening stops
                  automatically after {RECORD_SECONDS} seconds.
                </p>
              )}
              {phase === "listening" && (
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">
                    Listening… {seconds}/{RECORD_SECONDS}s
                  </p>
                  <button onClick={handleCancel} className="mt-1 text-sm text-error hover:underline">
                    Cancel
                  </button>
                </div>
              )}
              {phase === "analyzing" && (
                <div className="w-full max-w-xs">
                  <p className="mb-2 text-center text-sm font-medium text-secondary-text">
                    Identifying the song…
                  </p>
                  <div className="h-2 overflow-hidden rounded-full bg-border">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: "easeOut", duration: 0.25 }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="w-full max-w-md">
              <Waveform active={phase === "listening"} />
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {phase === "error" && error && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-auto mt-6 max-w-md rounded-2xl border border-error/30 bg-error/5 p-5"
              >
                <p className="flex items-start gap-2 text-left text-sm text-secondary-text">
                  <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-error" />
                  {error}
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <button
                    onClick={handleStart}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-black hover:bg-primary-hover"
                  >
                    <Mic className="h-4 w-4" />
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate("/search?q=love")}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium text-secondary-text hover:text-primary"
                  >
                    Search Instead <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Demo mode note */}
          {!hasAuddKey && phase !== "analyzing" && phase !== "listening" && (
            <p className="mx-auto mt-6 max-w-md text-xs text-muted">
              Demo mode: add your free{" "}
              <code className="rounded bg-border/40 px-1.5 py-0.5 text-primary">VITE_AUDD_API_KEY</code>{" "}
              (audd.io) to the <code className="rounded bg-border/40 px-1.5 py-0.5 text-primary">.env</code>{" "}
              file to identify real songs.
            </p>
          )}
        </div>
      </section>

      {/* Manual search */}
      <section className="mt-10">
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
  );
}
