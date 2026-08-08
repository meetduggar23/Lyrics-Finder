import { AnimatePresence, motion } from "framer-motion";
import { Mic, Square } from "lucide-react";
import { cn } from "@/utils/cn";
import type { RecognitionPhase } from "@/hooks/useSongRecognition";

export type HeroPhase = RecognitionPhase;

interface ListeningModuleProps {
  phase: HeroPhase;
  seconds: number;
  progress: number;
  onStart: () => void;
  onCancel: () => void;
}

const WAVE_BARS = 21;
const PULSE_HEIGHTS = [8, 16, 24, 12, 20, 28, 9, 18];

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-8 items-end justify-center gap-[3px]" aria-hidden="true">
      {Array.from({ length: WAVE_BARS }).map((_, i) => (
        <motion.span
          key={i}
          className={cn(
            "w-1 rounded-full",
            active ? "bg-primary/70" : "bg-primary/30",
          )}
          animate={active ? { height: PULSE_HEIGHTS[i % 8] } : { height: 4 }}
          transition={
            active
              ? {
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 0.8 + (i % 5) * 0.12,
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
    <div className="flex flex-col items-center gap-4">
      {/* Microphone with subtle radar rings */}
      <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
        {/* Soft breathing ring */}
        <motion.div
          className="absolute inset-4 rounded-full border border-primary/15 sm:inset-5"
          animate={{ scale: [1, 1.08], opacity: [0.35, 0.8] }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 3.5,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        />

        {/* Radar ripples (only while listening) */}
        {[0, 1].map((ring) => (
          <motion.span
            key={ring}
            className="absolute inset-0 rounded-full border border-primary/20"
            animate={
              listening
                ? { scale: [1, 1.18], opacity: [0.5, 0] }
                : { scale: 1, opacity: 0 }
            }
            transition={
              listening
                ? { repeat: Infinity, duration: 2.4, delay: ring * 0.8, ease: "easeOut" }
                : { duration: 0.3 }
            }
            aria-hidden="true"
          />
        ))}

        {/* Green microphone button */}
        <motion.button
          onClick={listening ? onCancel : onStart}
          disabled={analyzing}
          aria-label={listening ? "Stop listening" : "Start listening"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          animate={listening ? { scale: [1, 1.04, 1] } : { scale: 1 }}
          transition={
            listening
              ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
              : { duration: 0.3 }
          }
          className={cn(
            "relative flex h-36 w-36 items-center justify-center rounded-full text-[#F7EAE0] transition-shadow duration-300 sm:h-40 sm:w-40",
            listening
              ? "bg-primary shadow-[0_0_50px_rgba(29,69,51,0.5)]"
              : "bg-primary shadow-[0_0_35px_rgba(29,69,51,0.3)] hover:shadow-[0_0_55px_rgba(29,69,51,0.45)]",
            analyzing && "cursor-not-allowed opacity-60",
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
                <Square className="h-7 w-7 fill-current sm:h-8 sm:w-8" />
              </motion.span>
            ) : (
              <motion.span
                key="mic"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="flex items-center justify-center"
              >
                <Mic className="h-11 w-11 sm:h-12 sm:w-12" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Status indicator */}
      <div className="flex flex-col items-center gap-2">
        {phase !== "idle" && (
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 backdrop-blur">
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
        )}

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

      {/* Subtle equalizer (minimal stand-in for the removed dotted line) */}
      <Waveform active={listening} />
    </div>
  );
}
