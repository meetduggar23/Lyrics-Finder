/**
 * Lightweight inline audio preview helper.
 * Plays a 30-second preview from a single shared element so only one
 * preview plays at a time — no global player UI needed.
 */

let currentAudio: HTMLAudioElement | null = null;
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

export function playPreview(url: string): void {
  if (!url) return;
  stopPreview();
  const audio = new Audio(url);
  audio.volume = 0.7;
  audio.addEventListener("ended", () => {
    if (currentAudio === audio) currentAudio = null;
    notify();
  });
  audio.addEventListener("pause", () => {
    if (currentAudio === audio) currentAudio = null;
    notify();
  });
  void audio.play().catch(() => {
    currentAudio = null;
    notify();
  });
  currentAudio = audio;
  notify();
}

export function stopPreview(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
    notify();
  }
}
