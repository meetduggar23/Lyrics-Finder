import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Microphone recording hook using the MediaRecorder API.
 * Captures a fixed-length clip (default 8 seconds) suitable for
 * audio fingerprinting services like AudD.
 */

const RECORD_SECONDS = 8;

export function useRecorder(onComplete?: (blob: Blob) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);
  const startingRef = useRef(false);

  const cleanupStream = useCallback(() => {
    startingRef.current = false;
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
    setIsRecording(false);
    setSeconds(0);
  }, []);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      cleanupStream();
    };
  }, [cleanupStream]);

  const start = useCallback(async () => {
    if (startingRef.current) return;
    startingRef.current = true;
    setError(null);
    setBlob(null);
    chunksRef.current = [];
    cancelledRef.current = false;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch {
      startingRef.current = false;
      setError("Microphone access denied. Allow mic permission and try again.");
      return;
    }

    // Cancelled or unmounted while the permission prompt was pending
    if (cancelledRef.current) {
      startingRef.current = false;
      stream.getTracks().forEach((t) => t.stop());
      return;
    }

    let recorder: MediaRecorder;
    try {
      const mimeType = ["audio/webm", "audio/ogg", "audio/mp4"].find((t) =>
        MediaRecorder.isTypeSupported(t),
      );
      recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
    } catch {
      startingRef.current = false;
      stream.getTracks().forEach((t) => t.stop());
      setError("Recording is not supported in this browser.");
      return;
    }

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const finalBlob = new Blob(chunksRef.current, {
        type: recorder.mimeType || "audio/webm",
      });
      setBlob(finalBlob);
      if (!cancelledRef.current) onComplete?.(finalBlob);
      cleanupStream();
    };

    streamRef.current = stream;
    recorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
    setSeconds(0);

    timerRef.current = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  }, [onComplete, cleanupStream]);

  const stop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  useEffect(() => {
    if (isRecording && seconds >= RECORD_SECONDS) {
      stop();
    }
  }, [isRecording, seconds, stop]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    cleanupStream();
  }, [cleanupStream]);

  return { isRecording, seconds, error, blob, start, stop, cancel };
}
