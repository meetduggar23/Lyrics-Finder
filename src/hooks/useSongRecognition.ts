import { useEffect, useRef, useState } from "react";
import { useRecorder } from "@/hooks/useRecorder";
import { recognizeAudio } from "@/services/audd";
import { findTrack } from "@/services/deezer";
import type { DetectedSong, Song } from "@/types";

export type RecognitionPhase = "idle" | "listening" | "analyzing" | "error";

interface UseSongRecognitionOptions {
  /** How long (ms) to hold the "Song Detected" reveal before invoking onDetected. */
  holdMs?: number;
}

/**
 * Full microphone recognition flow: record → identify → match track.
 * Calls onDetected once the song has been recognized and matched.
 */
export function useSongRecognition(
  onDetected?: (detected: DetectedSong, track: Song | null) => void,
  options?: UseSongRecognitionOptions,
) {
  const holdMs = options?.holdMs ?? 1400;
  const [phase, setPhase] = useState<RecognitionPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [detectedSong, setDetectedSong] = useState<DetectedSong | null>(null);
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
      setDetectedSong(detected);
      setProgress(100);
      const track: Song | null = await findTrack(detected.title, detected.artist);
      window.clearInterval(timer);
      await new Promise((r) => setTimeout(r, holdMs));
      onDetected?.(detected, track);
      setPhase("idle");
    } catch (e) {
      window.clearInterval(timer);
      setDetectedSong(null);
      setError(e instanceof Error ? e.message : "Recognition failed. Please try again.");
      setPhase("error");
    }
  };

  const startListening = async () => {
    setDetectedSong(null);
    setError(null);
    setPhase("listening");
    await start();
  };

  const cancelListening = () => {
    cancel();
    setDetectedSong(null);
    setPhase("idle");
    setError(null);
  };

  return {
    phase,
    error,
    progress,
    detectedSong,
    seconds,
    startListening,
    cancelListening,
  };
}
