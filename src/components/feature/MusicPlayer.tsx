import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { usePlayerStore } from "@/store/player";
import { formatDuration } from "@/utils/format";
import { PLACEHOLDER_IMAGE } from "@/constants";

export function MusicPlayer() {
  const {
    current,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    togglePlay,
    seekTo,
    setVolume,
    toggleMute,
    next,
    previous,
    close,
  } = usePlayerStore();

  if (!current) return null;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(e.target.value));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[80] border-t border-border bg-card/95 backdrop-blur-xl"
        role="region"
        aria-label="Music player"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
          {/* Song info */}
          <div className="flex min-w-0 w-40 items-center gap-3 sm:w-56">
            <img
              src={current.cover || PLACEHOLDER_IMAGE}
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg object-cover sm:h-12 sm:w-12"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {current.title}
              </p>
              <p className="truncate text-xs text-secondary-text">
                {current.artist}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-1 flex-col items-center gap-1">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={previous}
                className="rounded-full p-2 text-secondary-text transition-colors hover:text-foreground"
                aria-label="Previous"
              >
                <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={togglePlay}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-black shadow-lg shadow-primary/30 transition-transform hover:scale-105"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 translate-x-0.5" />
                )}
              </button>
              <button
                onClick={next}
                className="rounded-full p-2 text-secondary-text transition-colors hover:text-foreground"
                aria-label="Next"
              >
                <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            <div className="flex w-full max-w-md items-center gap-2">
              <span className="w-8 text-right text-xs tabular-nums text-muted">
                {formatDuration(progress)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 30}
                value={progress}
                onChange={handleSeek}
                className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-primary"
                aria-label="Seek"
              />
              <span className="w-8 text-xs tabular-nums text-muted">
                {formatDuration(duration)}
              </span>
            </div>
          </div>

          {/* Volume + close */}
          <div className="hidden w-40 items-center gap-2 sm:flex">
            <button
              onClick={toggleMute}
              className="text-secondary-text transition-colors hover:text-foreground"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-primary"
              aria-label="Volume"
            />
          </div>

          <button
            onClick={close}
            className="rounded-full p-2 text-secondary-text transition-colors hover:text-foreground"
            aria-label="Close player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
