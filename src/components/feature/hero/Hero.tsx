import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, TriangleAlert } from "lucide-react";
import { hasAuddKey } from "@/services/audd";
import { useSongRecognition } from "@/hooks/useSongRecognition";
import type { DetectedSong, Song } from "@/types";
import { HeroBackground } from "./HeroBackground";
import { ListeningModule } from "./ListeningModule";
import { MusicShowcase } from "./MusicShowcase";

const staggerItem = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

export function Hero() {
  const navigate = useNavigate();
  const [detectedTrack, setDetectedTrack] = useState<Song | null>(null);

  const onDetected = useCallback((_detected: DetectedSong, track: Song | null) => {
    setDetectedTrack(track);
  }, []);

  const {
    phase,
    error,
    progress,
    detectedSong,
    seconds,
    startListening,
    cancelListening,
  } = useSongRecognition(onDetected);

  const handleStartListening = () => {
    setDetectedTrack(null);
    startListening();
  };

  const handleLyrics = () => {
    if (detectedTrack) {
      navigate(`/song/${detectedTrack.id}`);
    } else if (detectedSong) {
      navigate(
        `/search?q=${encodeURIComponent(`${detectedSong.title} ${detectedSong.artist}`)}`,
      );
    }
  };

  const handleManualSearch = () => {
    const target = document.getElementById("manual-search");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      navigate("/search");
    }
  };

  const listening = phase === "listening";
  const analyzing = phase === "analyzing";

  return (
    <section className="relative overflow-hidden">
      <HeroBackground />

      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pt-12 lg:pb-16 lg:pt-14">
        <div className="grid items-start gap-10 lg:grid-cols-[45fr_55fr] lg:gap-10">
          {/* LEFT — primary interaction area */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.div {...staggerItem(0.05)} className="w-full">
              <span className="sr-only">AI Music Recognition</span>
              <h1 className="text-4xl font-black leading-[1.06] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Find Any Song
                <br />
                With <span className="text-gradient-green">AI</span>
                <br />
                In <span className="text-gradient-green">Seconds</span>.
              </h1>
              <p className="mx-auto mt-4 max-w-md text-base text-secondary-text sm:text-lg lg:mx-0">
                Identify songs playing around you and instantly discover lyrics,
                artist information, and album details.
              </p>
            </motion.div>

            <motion.div {...staggerItem(0.15)} className="mt-10 w-full sm:mt-12">
              <ListeningModule
                phase={phase}
                seconds={seconds}
                progress={progress}
                onStart={handleStartListening}
                onCancel={cancelListening}
              />
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {phase === "error" && error && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 w-full max-w-md rounded-2xl border border-error/30 bg-error/5 p-5"
                >
                  <p className="flex items-start gap-2 text-left text-sm text-secondary-text">
                    <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-error" />
                    {error}
                  </p>
                  <div className="mt-4 flex justify-center gap-3 lg:justify-start">
                    <button
                      onClick={handleStartListening}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-[#F7EAE0] hover:bg-primary-hover"
                    >
                      <Mic className="h-4 w-4" />
                      Try Again
                    </button>
                    <button
                      onClick={handleManualSearch}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium text-secondary-text hover:text-primary"
                    >
                      Search Instead
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Demo mode note */}
            {!hasAuddKey && phase !== "analyzing" && phase !== "listening" && (
              <p className="mt-6 max-w-md text-xs text-muted lg:text-left">
                Demo mode: add your free{" "}
                <code className="rounded bg-border/40 px-1.5 py-0.5 text-primary">
                  VITE_AUDD_API_KEY
                </code>{" "}
                (audd.io) to the{" "}
                <code className="rounded bg-border/40 px-1.5 py-0.5 text-primary">
                  .env
                </code>{" "}
                file to identify real songs.
              </p>
            )}
          </div>

          {/* RIGHT — immersive music showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:col-start-2"
          >
            <MusicShowcase
              listening={listening}
              analyzing={analyzing}
              detected={detectedSong}
              onLyrics={handleLyrics}
            />
          </motion.div>
        </div>

        {/* Horizontal control bar: description | CTA | stats */}
        <motion.div
          {...staggerItem(0.25)}
          className="mx-auto mt-12 flex max-w-[1200px] flex-col items-center gap-8 lg:mt-14 lg:flex-row lg:items-center lg:justify-between lg:gap-14"
        >
          {/* Description */}
          <p className="max-w-[420px] text-center text-base leading-relaxed text-secondary-text lg:text-left">
            Tap the microphone and let AI identify the music around you.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={listening ? cancelListening : handleStartListening}
              disabled={analyzing}
              className="inline-flex h-14 items-center gap-2 rounded-full bg-primary px-8 text-sm font-bold text-[#F7EAE0] shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/40 active:scale-95 disabled:pointer-events-none disabled:opacity-60"
            >
              {listening ? (
                <>🛑 Cancel Listening</>
              ) : analyzing ? (
                <>⏳ Identifying…</>
              ) : (
                <>🎤 Tap to Listen</>
              )}
            </button>
            <button
              onClick={handleManualSearch}
              className="inline-flex h-14 items-center rounded-full border border-border bg-white/50 px-8 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary active:scale-95"
            >
              Search Manually
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center lg:text-left">
              <p className="text-xl font-extrabold text-foreground">500K+</p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted">
                Songs
              </p>
            </div>
            <span className="h-9 w-px bg-[#5E3122]/15" />
            <div className="text-center lg:text-left">
              <p className="text-xl font-extrabold text-foreground">120+</p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted">
                Countries
              </p>
            </div>
            <span className="h-9 w-px bg-[#5E3122]/15" />
            <div className="text-center lg:text-left">
              <p className="text-xl font-extrabold text-foreground">Millions</p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted">
                Lyrics
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
