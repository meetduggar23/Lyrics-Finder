import { useMemo } from "react";
import { motion } from "framer-motion";
import { Heart, Music, Music2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface ShowcaseSong {
  title: string;
  artist: string;
  gradient: string;
}

const SONGS: ShowcaseSong[] = [
  {
    title: "Midnight Drive",
    artist: "Aurora Waves",
    gradient: "from-emerald-400 via-teal-600 to-emerald-950",
  },
  {
    title: "Neon Skyline",
    artist: "Luna Ray",
    gradient: "from-violet-500 via-indigo-600 to-slate-950",
  },
  {
    title: "Golden Hour",
    artist: "The Static",
    gradient: "from-amber-400 via-orange-600 to-rose-950",
  },
  {
    title: "Echoes",
    artist: "Nova Heights",
    gradient: "from-sky-400 via-cyan-600 to-blue-950",
  },
  {
    title: "Wildfire",
    artist: "Cobalt Kids",
    gradient: "from-fuchsia-500 via-pink-600 to-rose-950",
  },
];

const WAVE = [5, 9, 6, 12, 8, 15, 7, 13, 6, 10, 5, 8];
const WAVE_ALT = [10, 6, 12, 7, 14, 8, 12, 6, 10, 5, 9, 6];

function MiniWaveform() {
  return (
    <div className="mt-3 flex items-end gap-[3px]" aria-hidden="true">
      {WAVE.map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-primary/60"
          style={{ height: h }}
          animate={{ height: [h, WAVE_ALT[i], h] }}
          transition={{
            repeat: Infinity,
            duration: 1.4 + (i % 4) * 0.18,
            ease: "easeInOut",
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
}

interface ShowcaseCardProps {
  song: ShowcaseSong;
  className?: string;
  rotate?: number;
  floatDuration?: number;
  floatDelay?: number;
  featured?: boolean;
}

function ShowcaseCard({
  song,
  className,
  rotate = 0,
  floatDuration = 7,
  floatDelay = 0,
  featured = false,
}: ShowcaseCardProps) {
  return (
    <motion.div
      className={cn("group", className)}
      style={{ rotate }}
      animate={{ y: [0, -10, 0] }}
      transition={{
        repeat: Infinity,
        duration: floatDuration,
        delay: floatDelay,
        ease: "easeInOut",
      }}
      whileHover={{ rotate: 0, scale: 1.05, y: -16 }}
    >
      <div
        className={cn(
          "rounded-2xl border border-white/10 bg-[#151515]/90 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl transition-shadow duration-300",
          featured
            ? "ring-1 ring-primary/25 shadow-[0_0_50px_rgba(29,185,84,0.12)]"
            : "group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]",
        )}
      >
        <div
          className={cn(
            "relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br",
            song.gradient,
          )}
        >
          <Music
            className="absolute right-3 top-3 h-5 w-5 text-white/40"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10"
            aria-hidden="true"
          />
          <div className="absolute bottom-2.5 left-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
              {featured ? "Now Playing" : "Track"}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {song.title}
            </p>
            <p className="truncate text-xs text-secondary-text">{song.artist}</p>
          </div>
          <Heart
            className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              featured
                ? "fill-primary text-primary"
                : "text-white/40 group-hover:text-primary",
            )}
            aria-hidden="true"
          />
        </div>
        <MiniWaveform />
      </div>
    </motion.div>
  );
}

const CONNECT_LINES = [
  "M 300 300 C 250 260, 180 190, 130 130",
  "M 300 300 C 330 250, 420 190, 470 150",
  "M 300 300 C 260 340, 190 420, 140 470",
  "M 300 300 C 340 340, 420 410, 470 450",
];

export function MusicShowcase() {
  const equalizer = useMemo(
    () =>
      [
        { left: "16%", top: "14%", duration: 0.9 },
        { left: "72%", top: "58%", duration: 1.1 },
      ].map((e, i) => ({ ...e, id: i })),
    [],
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: `${Math.round(8 + Math.random() * 84)}%`,
        top: `${Math.round(10 + Math.random() * 80)}%`,
        duration: Math.round((5 + Math.random() * 7) * 10) / 10,
        delay: Math.round(Math.random() * 4 * 10) / 10,
        green: Math.random() > 0.6,
      })),
    [],
  );

  return (
    <>
      {/* Mobile: horizontal carousel */}
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:hidden">
        {SONGS.map((song, i) => (
          <ShowcaseCard
            key={song.title}
            song={song}
            featured={i === 2}
            rotate={(i % 2 === 0 ? -1 : 1) * 2}
            floatDuration={6 + i * 0.4}
            floatDelay={i * 0.3}
            className="w-56 shrink-0 snap-center"
          />
        ))}
      </div>

      {/* Tablet / desktop: layered floating scene */}
      <div className="relative hidden h-[460px] md:block lg:h-[520px]">
        {/* Soft blurred gradients */}
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(29,185,84,0.08),transparent_62%)]"
          aria-hidden="true"
        />
        <motion.div
          className="absolute -left-10 top-1/4 h-72 w-72 rounded-full bg-primary/10 blur-[100px]"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-white/5 blur-[110px]"
          animate={{ x: [0, -25, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />

        {/* Glowing connection lines */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 600 600"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="hero-connect" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(29,185,84,0.55)" />
              <stop offset="100%" stopColor="rgba(29,185,84,0)" />
            </linearGradient>
          </defs>
          {CONNECT_LINES.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              stroke="url(#hero-connect)"
              strokeWidth="1.3"
              strokeDasharray="4 9"
              animate={{ strokeDashoffset: [0, -52] }}
              transition={{
                repeat: Infinity,
                duration: 3.2,
                delay: i * 0.7,
                ease: "linear",
              }}
            />
          ))}
        </svg>

        {/* Floating equalizer bars */}
        {equalizer.map((e) => (
          <div
            key={e.id}
            className="absolute flex h-10 items-end gap-1"
            style={{ left: e.left, top: e.top }}
            aria-hidden="true"
          >
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="w-1 rounded-full bg-primary/50"
                animate={{ height: [6, 20, 8, 16][i % 4] }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: e.duration + i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        ))}

        {/* Floating music notes */}
        <motion.div
          className="absolute left-[22%] top-[6%] text-primary/50"
          animate={{ y: [0, -28], opacity: [0.2, 0.7, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <Music2 className="h-5 w-5" />
        </motion.div>
        <motion.div
          className="absolute right-[8%] bottom-[6%] text-white/25"
          animate={{ y: [0, -22], opacity: [0.15, 0.5, 0] }}
          transition={{ repeat: Infinity, duration: 6.5, delay: 1.2, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <Music2 className="h-4 w-4" />
        </motion.div>
        <motion.div
          className="absolute bottom-[26%] left-[6%] text-primary/40"
          animate={{ y: [0, -30], opacity: [0.15, 0.6, 0] }}
          transition={{ repeat: Infinity, duration: 7.5, delay: 0.6, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <Music2 className="h-4 w-4" />
        </motion.div>

        {/* Tiny particles */}
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className={cn(
              "absolute h-1 w-1 rounded-full",
              p.green ? "bg-primary/60" : "bg-white/30",
            )}
            style={{ left: p.left, top: p.top }}
            animate={{ y: [0, -20, 0], opacity: [0, 0.8, 0] }}
            transition={{
              repeat: Infinity,
              duration: p.duration,
              delay: p.delay,
              ease: "easeInOut",
            }}
            aria-hidden="true"
          />
        ))}

        {/* Cards in layered perspective */}
        <ShowcaseCard
          song={SONGS[0]}
          featured
          floatDuration={7.5}
          className="absolute left-1/2 top-1/2 z-20 w-44 -translate-x-1/2 -translate-y-1/2 sm:w-52 lg:w-60"
        />
        <ShowcaseCard
          song={SONGS[1]}
          rotate={-8}
          floatDuration={8.5}
          floatDelay={0.8}
          className="absolute left-[2%] top-[4%] z-10 w-36 sm:w-40 lg:w-48"
        />
        <ShowcaseCard
          song={SONGS[2]}
          rotate={6}
          floatDuration={9}
          floatDelay={1.4}
          className="absolute right-[2%] top-[10%] z-10 w-32 sm:w-36 lg:w-44"
        />
        <ShowcaseCard
          song={SONGS[3]}
          rotate={-5}
          floatDuration={8}
          floatDelay={2}
          className="absolute bottom-[6%] left-[6%] z-10 w-36 sm:w-40 lg:w-48"
        />
        <ShowcaseCard
          song={SONGS[4]}
          rotate={7}
          floatDuration={9.5}
          floatDelay={2.6}
          className="absolute bottom-[12%] right-[4%] z-10 w-32 sm:w-36 lg:w-44"
        />
      </div>
    </>
  );
}
