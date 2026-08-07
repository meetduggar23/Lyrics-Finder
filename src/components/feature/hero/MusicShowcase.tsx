import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Heart, Music, Music2, Search } from "lucide-react";
import { cn } from "@/utils/cn";
import { useFavoritesStore } from "@/store/favorites";
import type { DetectedSong } from "@/types";

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

/* ------------------------------------------------------------------ */
/* Card face (shared by desktop scene and mobile carousel)             */
/* ------------------------------------------------------------------ */

interface CardFaceProps {
  song: ShowcaseSong;
  isCenter?: boolean;
  listening?: boolean;
  detected?: boolean;
  detectedSong?: DetectedSong | null;
  fav?: boolean;
  onLyrics?: () => void;
  onFavorite?: () => void;
}

function CardFace({
  song,
  isCenter,
  listening,
  detected,
  detectedSong,
  fav,
  onLyrics,
  onFavorite,
}: CardFaceProps) {
  const title = detected && detectedSong ? detectedSong.title : song.title;
  const artist = detected && detectedSong ? detectedSong.artist : song.artist;
  const coverUrl = detected && detectedSong ? detectedSong.coverUrl : undefined;
  const showActions = detected && isCenter;

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/10 bg-[#151515]/90 p-3 shadow-2xl shadow-black/60 backdrop-blur-xl",
        detected && isCenter && "shadow-[0_0_60px_rgba(29,185,84,0.25)]",
      )}
    >
      {/* Soft glow */}
      <AnimatePresence>
        {isCenter && (listening || detected) && (
          <motion.div
            className="pointer-events-none absolute -inset-4 rounded-3xl bg-primary/20 blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.35, 0.75, 0.35] }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Album artwork */}
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden rounded-xl",
          !coverUrl && cn("bg-gradient-to-br", song.gradient),
        )}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`${title} cover`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <>
            <Music className="absolute right-3 top-3 h-5 w-5 text-white/40" aria-hidden="true" />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10"
              aria-hidden="true"
            />
          </>
        )}
        <div className="absolute bottom-2.5 left-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/85 drop-shadow">
            {detected && isCenter ? "✨ Song Detected" : isCenter ? "Now Playing" : "Track"}
          </p>
        </div>

        {/* Equalizer overlay while listening */}
        <AnimatePresence>
          {isCenter && listening && (
            <motion.div
              className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-1 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              aria-hidden="true"
            >
              {[16, 26, 34, 26, 16].map((h, i) => (
                <motion.span
                  key={i}
                  className="w-1.5 rounded-full bg-primary"
                  animate={{ height: [h, h * 0.3, h] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.85 + i * 0.14,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Song info */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          <p className="truncate text-xs text-secondary-text">{artist}</p>
        </div>
        {detected && isCenter ? (
          <button
            onClick={onFavorite}
            aria-label="Favorite"
            className="shrink-0 text-primary transition-transform hover:scale-110"
          >
            <Heart className={cn("h-4 w-4", fav && "fill-current")} />
          </button>
        ) : (
          <Heart
            className="h-4 w-4 shrink-0 text-white/40 transition-colors group-hover:text-primary"
            aria-hidden="true"
          />
        )}
      </div>

      <MiniWaveform />

      {/* Detected actions: lyrics + favorite */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
          >
            <div className="mt-3 flex gap-2">
              <button
                onClick={onLyrics}
                className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-xs font-bold text-black transition-colors hover:bg-primary-hover"
              >
                <Search className="h-3.5 w-3.5" />
                View Lyrics
              </button>
              <button
                onClick={onFavorite}
                aria-label="Add to favorites"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                  fav
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-white/15 text-white/70 hover:border-primary/40 hover:text-primary",
                )}
              >
                <Heart className={cn("h-4 w-4", fav && "fill-current")} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Slot layout — like a fanned deck                                     */
/* ------------------------------------------------------------------ */

interface Slot {
  key: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  z: number;
  size: "lg" | "md" | "sm";
  dealDelay: number;
}

const SLOTS: Slot[] = [
  { key: "center", x: 0, y: 6, rotate: 0, scale: 1, z: 30, size: "lg", dealDelay: 0 },
  { key: "left-top", x: -172, y: -152, rotate: -12, scale: 0.87, z: 22, size: "md", dealDelay: 0.14 },
  { key: "right-top", x: 174, y: -160, rotate: 12, scale: 0.84, z: 22, size: "md", dealDelay: 0.28 },
  { key: "left-bottom", x: -156, y: 132, rotate: -18, scale: 0.8, z: 18, size: "sm", dealDelay: 0.42 },
  { key: "right-bottom", x: 160, y: 142, rotate: 18, scale: 0.78, z: 18, size: "sm", dealDelay: 0.56 },
];

const SIZE_CLASSES: Record<Slot["size"], string> = {
  lg: "w-48 sm:w-56 lg:w-60",
  md: "w-40 sm:w-44 lg:w-48",
  sm: "w-36 sm:w-40 lg:w-44",
};

function shuffleSlots(slots: Slot[], seed: number): Slot[] {
  const arr = [...slots];
  let s = (seed * 2654435761) >>> 0;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ------------------------------------------------------------------ */
/* Playing card — physical card in the 3D scene                         */
/* ------------------------------------------------------------------ */

interface PlayingCardProps {
  slot: Slot;
  song: ShowcaseSong;
  index: number;
  hoveredSlotKey: string | null;
  onHoverChange: (key: string | null) => void;
  listening: boolean;
  analyzing: boolean;
  detected: boolean;
  detectedSong: DetectedSong | null;
  onLyrics?: () => void;
  onFavorite?: () => void;
  fav?: boolean;
}

function PlayingCard({
  slot,
  song,
  index,
  hoveredSlotKey,
  onHoverChange,
  listening,
  analyzing,
  detected,
  detectedSong,
  onLyrics,
  onFavorite,
  fav,
}: PlayingCardProps) {
  const [dealt, setDealt] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 3D tilt follows the cursor
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), {
    stiffness: 130,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), {
    stiffness: 130,
    damping: 22,
  });

  const isCenter = slot.key === "center";
  const hovered = hoveredSlotKey === slot.key;
  const active = isCenter && (listening || analyzing || detected);
  const dimmed = (listening || analyzing || detected) && !isCenter && !hovered;

  // Neighbors slide away from the hovered card
  let pushX = 0;
  let pushY = 0;
  if (hoveredSlotKey && hoveredSlotKey !== slot.key) {
    const hoveredSlot = SLOTS.find((s) => s.key === hoveredSlotKey);
    if (hoveredSlot) {
      pushX = Math.sign(slot.x - hoveredSlot.x) * 18;
      pushY = Math.sign(slot.y - hoveredSlot.y) * 12;
    }
  }

  const scale =
    slot.scale *
    (hovered ? 1.06 : 1) *
    (active ? 1.08 : 1) *
    (detected && !isCenter ? 0.92 : 1);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
    onHoverChange(null);
  };

  return (
    <motion.div
      ref={ref}
      className="absolute left-1/2 top-1/2 will-change-transform"
      style={{ zIndex: hovered ? 90 : slot.z, perspective: 900 }}
      initial={{ x: 0, y: 0, rotate: 0, scale: 0.55, z: 0, opacity: 1, filter: "blur(0px)" }}
      animate={{
        x: slot.x + pushX,
        y: slot.y + pushY + (hovered ? -20 : 0),
        rotate: hovered || (detected && isCenter) ? 0 : slot.rotate,
        scale,
        z: hovered ? 80 : 0,
        opacity: dimmed ? 0.45 : 1,
        filter: dimmed ? "blur(4px)" : "blur(0px)",
      }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 27,
        mass: 0.9,
        delay: dealt ? 0 : slot.dealDelay,
      }}
      onAnimationComplete={() => setDealt(true)}
      onMouseEnter={() => onHoverChange(slot.key)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={SIZE_CLASSES[slot.size]}
      >
        {/* Slow independent idle motion — never synchronized */}
        <motion.div
          animate={{
            y: [0, -7, 0],
            x: [0, 2, -2, 0],
            rotate: [0, 1.6, -1.4, 0],
            scale: active ? [1, 1.04, 1] : [1, 1.012, 1],
          }}
          transition={{
            repeat: Infinity,
            ease: "easeInOut",
            duration: 6.4 + (index % 5) * 1.5,
            delay: index * 0.9,
          }}
        >
          <CardFace
            song={song}
            isCenter={isCenter}
            listening={listening}
            detected={detected}
            detectedSong={detectedSong}
            fav={fav}
            onLyrics={onLyrics}
            onFavorite={onFavorite}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Ambient scene layer                                                  */
/* ------------------------------------------------------------------ */

const CONNECT_LINES = [
  "M 300 300 C 250 260, 180 190, 130 130",
  "M 300 300 C 330 250, 420 190, 470 150",
  "M 300 300 C 260 340, 190 420, 140 470",
  "M 300 300 C 340 340, 420 410, 470 450",
];

function AmbientLayer() {
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
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Music showcase                                                       */
/* ------------------------------------------------------------------ */

interface MusicShowcaseProps {
  listening: boolean;
  analyzing: boolean;
  detected: DetectedSong | null;
  onLyrics?: () => void;
}

export function MusicShowcase({
  listening,
  analyzing,
  detected,
  onLyrics,
}: MusicShowcaseProps) {
  const [shuffleKey, setShuffleKey] = useState(0);
  const [hoveredSlotKey, setHoveredSlotKey] = useState<string | null>(null);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);

  const detectedId =
    detected?.songId || (detected ? `detected-${detected.title}` : "");
  const fav = detected ? isFavorite(detectedId, "song") : false;

  const handleFavorite = () => {
    if (!detected) return;
    toggleFavorite({
      id: detectedId,
      type: "song",
      title: detected.title,
      subtitle: detected.artist,
      image: detected.coverUrl,
    });
  };

  // Periodic deck shuffle (15–20s), paused while recognition is running
  useEffect(() => {
    if (listening || analyzing || detected) return;
    const timer = window.setTimeout(
      () => setShuffleKey((k) => k + 1),
      15000 + Math.random() * 5000,
    );
    return () => window.clearTimeout(timer);
  }, [listening, analyzing, detected, shuffleKey]);

  const slots = useMemo(() => shuffleSlots(SLOTS, shuffleKey), [shuffleKey]);

  return (
    <>
      {/* Mobile: horizontal carousel */}
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:hidden">
        {SONGS.map((song, i) => (
          <motion.div
            key={song.title}
            className="w-56 shrink-0 snap-center"
            animate={{ y: [0, -8, 0] }}
            transition={{
              repeat: Infinity,
              duration: 6 + i * 0.6,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          >
            <CardFace song={song} isCenter={i === 2} />
          </motion.div>
        ))}
      </div>

      {/* Tablet / desktop: layered 3D scene */}
      <div
        className="relative hidden h-[460px] md:block lg:h-[500px]"
        style={{ perspective: 1400 }}
      >
        <AmbientLayer />

        <div key={shuffleKey} className="absolute inset-0">
          {slots.map((slot, i) => (
            <PlayingCard
              key={slot.key}
              slot={slot}
              song={SONGS[i]}
              index={i}
              hoveredSlotKey={hoveredSlotKey}
              onHoverChange={setHoveredSlotKey}
              listening={listening}
              analyzing={analyzing}
              detected={Boolean(detected)}
              detectedSong={detected}
              onLyrics={onLyrics}
              onFavorite={handleFavorite}
              fav={fav}
            />
          ))}
        </div>
      </div>
    </>
  );
}
