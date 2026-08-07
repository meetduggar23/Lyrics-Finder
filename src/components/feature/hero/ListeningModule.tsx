import { AnimatePresence, motion } from "framer-motion";
import { Mic, Square } from "lucide-react";
import { cn } from "@/utils/cn";

export type HeroPhase = "idle" | "listening" | "analyzing" | "error";

interface ListeningModuleProps {
  phase: HeroPhase;
  seconds: number;
  progress: number;
  onStart: () => void;
  onCancel: () => void;
}

const WAVE_BARS = 32;
const PULSE_HEIGHTS = [8, 20, 48, 14, 34, 58, 10, 26];

function Waveform({ active }: { active: boolean }) {
  return (
    <div
      className="flex h-14 items-end justify-center gap-1 lg:justify-start"
      aria-hidden="true"
    >
      {Array.from({ length: WAVE_BARS }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1.5 rounded-full bg-primary/80"
          animate={active ? { height: PULSE_HEIGHTS[i % 8] } : { height: 5 }}
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

export function ListeningModule({
  phase,
  seconds,
  progress,
  onStart,
  onCancel,
}: ListeningModuleProps) {
  const listening = phase === "listening";
  const analyzing = phase === "analyzing";

  return (
    <div className="flex flex-col items-center gap-5 lg:items-start">
      {/* Microphone button with rings and circular waveform */}
      <div className="relative flex h-52 w-52 items-center justify-center sm:h-60 sm:w-60">
        {/* Soft breathing ring */}
        <motion.div
          className="absolute inset-4 rounded-full border border-primary/25"
          animate={{ scale: [1, 1.07], opacity: [0.4, 0.85] }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 2.2,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        />

        {/* Sound ripples (only while listening) */}
        {[0, 1, 2].map((ring) => (
          <motion.span
            key={ring}
            className="absolute inset-0 rounded-full border border-primary/40"
            animate={
              listening
                ? { scale: [1, 1.45], opacity: [0.55, 0] }
                : { scale: 1, opacity: 0 }
            }
            transition={
              listening
                ? { repeat: Infinity, duration: 2.1, delay: ring * 0.65, ease: "easeOut" }
                : { duration: 0.3 }
            }
            aria-hidden="true"
          />
        ))}

        {/* Animated waveform around the button */}
        <motion.svg
          viewBox="0 0 220 220"
          fill="none"
          className="absolute -inset-4"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: listening ? 9 : 20,
            ease: "linear",
          }}
          aria-hidden="true"
        >
          <circle
            cx="110"
            cy="110"
            r="102"
            stroke={listening ? "rgba(29,185,84,0.55)" : "rgba(29,185,84,0.3)"}
            strokeWidth="1.4"
            strokeDasharray="3 9"
          />
          <circle
            cx="110"
            cy="110"
            r="90"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
            strokeDasharray="16 12"
          />
        </motion.svg>
        <motion.svg
          viewBox="0 0 220 220"
          fill="none"
          className="absolute -inset-10"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 34, ease: "linear" }}
          aria-hidden="true"
        >
          <circle
            cx="110"
            cy="110"
            r="108"
            stroke="rgba(29,185,84,0.18)"
            strokeWidth="1"
            strokeDasharray="1 7"
          />
        </motion.svg>

        <motion.button
          onClick={listening ? onCancel : onStart}
          aria-label={listening ? "Stop listening" : "Start listening"}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          animate={listening ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={
            listening
              ? { repeat: Infinity, duration: 1.4, ease: "easeInOut" }
              : { duration: 0.3 }
          }
          className={cn(
            "relative flex h-28 w-28 items-center justify-center rounded-full text-black transition-shadow duration-300 sm:h-32 sm:w-32",
            listening
              ? "bg-primary shadow-[0_0_70px_rgba(29,185,84,0.55)]"
              : "bg-primary shadow-[0_0_30px_rgba(29,185,84,0.25)] hover:shadow-[0_0_55px_rgba(29,185,84,0.45)]",
          )}
        >
          <AnimatePresence mode="wait">
            {listening ? (
              <motion.span
                key="stop"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="flex items-center justify-center"
              >
                <Square className="h-8 w-8 fill-current" />
              </motion.span>
            ) : (
              <motion.span
                key="mic"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="flex items-center justify-center"
              >
                <Mic className="h-10 w-10" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Status indicator */}
      <div className="flex min-h-9 flex-col items-center gap-2 lg:items-start">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/70 px-4 py-1.5 backdrop-blur">
          {phase === "idle" && (
            <>
              <span className="h-2 w-2 rounded-full bg-white/60" />
              <span className="text-sm text-secondary-text">Ready to Listen</span>
            </>
          )}
          {listening && (
            <>
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="text-sm font-medium text-foreground">
                Listening… {seconds}s
              </span>
            </>
          )}
          {analyzing && (
            <>
              <span className="text-sm leading-none">✨</span>
              <span className="text-sm font-medium text-foreground">
                Song Detected
              </span>
            </>
          )}
          {phase === "error" && (
            <>
              <span className="h-2 w-2 rounded-full bg-error" />
              <span className="text-sm text-secondary-text">Something went wrong</span>
            </>
          )}
        </div>

        {/* Recognition progress */}
        {analyzing && (
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.25 }}
            />
          </div>
        )}
      </div>

      <Waveform active={listening} />

      <p className="max-w-xs text-center text-sm text-secondary-text lg:text-left">
        Tap the microphone and let AI identify the music around you.
      </p>
    </div>
  );
}
