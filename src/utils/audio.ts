/**
 * Lightweight inline audio preview helper.
 * Plays a 30-second preview from a single shared element so only one
 * preview plays at a time — no global player UI needed.
 */

let currentAudio: HTMLAudioElement | null = null;
let currentProgress: { current: number; duration: number } | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((l) => l());
}

export function subscribePreview(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function getPreviewingUrl(): string | null {
  if (!currentAudio || currentAudio.paused) return null;
  return currentAudio.src;
}

export function getPreviewProgress(): { current: number; duration: number } | null {
  return currentProgress;
}

function clearPreview(): void {
  currentAudio = null;
  currentProgress = null;
}

export function playPreview(url: string): void {
  if (!url) return;
  stopPreview();
  const audio = new Audio(url);
  audio.volume = 0.7;
  audio.addEventListener("loadedmetadata", () => {
    if (currentAudio !== audio) return;
    currentProgress = { current: 0, duration: audio.duration || 0 };
    notify();
  });
  audio.addEventListener("timeupdate", () => {
    if (currentAudio !== audio) return;
    currentProgress = { current: audio.currentTime, duration: audio.duration || 0 };
    notify();
  });
  audio.addEventListener("ended", () => {
    if (currentAudio === audio) {
      clearPreview();
      notify();
    }
  });
  audio.addEventListener("pause", () => {
    if (currentAudio === audio) {
      clearPreview();
      notify();
    }
  });
  void audio.play().catch(() => {
    clearPreview();
    notify();
  });
  currentAudio = audio;
  currentProgress = { current: 0, duration: 0 };
  notify();
}

export function stopPreview(): void {
  if (currentAudio) {
    currentAudio.pause();
    clearPreview();
    notify();
  }
}
