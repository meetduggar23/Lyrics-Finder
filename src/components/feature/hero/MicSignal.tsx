import { motion } from "framer-motion";

interface MicSignalProps {
  listening?: boolean;
}

/**
 * Animated sound waves traveling from the microphone toward the
 * active center card, connecting the two hero columns visually.
 */
export function MicSignal({ listening = false }: MicSignalProps) {
  const duration = listening ? 1.6 : 2.8;
  const opacity = listening ? 1 : 0.75;

  return (
    <div
      className="pointer-events-none absolute -left-[12%] right-[50%] top-[26%] z-0 hidden h-[230px] lg:block"
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Thin glowing connection lines */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="mic-signal-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(29,185,84,0.08)" />
            <stop offset="45%" stopColor="rgba(29,185,84,0.4)" />
            <stop offset="100%" stopColor="rgba(29,185,84,0)" />
          </linearGradient>
        </defs>
        <motion.path
          d="M 0 78 C 30 70, 60 55, 100 32"
          stroke="url(#mic-signal-line)"
          strokeWidth="0.8"
          strokeDasharray="1.5 3"
          animate={{ strokeDashoffset: [0, -9] }}
          transition={{ repeat: Infinity, duration, ease: "linear" }}
        />
        <motion.path
          d="M 0 82 C 34 76, 64 62, 100 40"
          stroke="rgba(29,185,84,0.16)"
          strokeWidth="0.7"
          strokeDasharray="1.5 3"
          animate={{ strokeDashoffset: [0, -9] }}
          transition={{
            repeat: Infinity,
            duration: duration + 0.8,
            delay: 0.6,
            ease: "linear",
          }}
        />
      </svg>

      {/* Traveling pulse dot */}
      <motion.span
        className="absolute h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(29,185,84,0.9)]"
        animate={{
          left: ["0%", "30%", "65%", "100%"],
          top: ["78%", "72%", "58%", "32%"],
        }}
        transition={{
          repeat: Infinity,
          duration,
          ease: "easeInOut",
          times: [0, 0.35, 0.7, 1],
        }}
      />

      {/* Audio pulse dots at the source (mic side) */}
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-primary/60"
          style={{ left: `${-2 + i * 8}%`, top: "81%" }}
          animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
            delay: i * 0.4,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Soft glow where the wave meets the card */}
      <motion.div
        className="absolute left-[97%] top-[29%] h-16 w-16 -translate-x-1/2 rounded-full bg-primary/10 blur-xl"
        animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.25, 1] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
      />
    </div>
  );
}
