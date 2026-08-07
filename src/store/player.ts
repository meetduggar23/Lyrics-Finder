import { create } from "zustand";
import type { PlayerState } from "@/types";

interface AudioElement extends HTMLAudioElement {
  _lfai?: boolean;
}

interface PlayerStoreState {
  current: PlayerState | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  audio: AudioElement | null;
  queue: PlayerState[];
  queueIndex: number;

// Actions
  playSong: (song: PlayerState, queue?: PlayerState[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resumePlayback: () => void;
  seekTo: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  next: () => void;
  previous: () => void;
  stop: () => void;
  close: () => void;
}

let audioInstance: AudioElement | null = null;

function getAudio(): AudioElement | null {
  if (typeof window === "undefined") return null;
  if (!audioInstance) {
    audioInstance = new Audio() as AudioElement;
    audioInstance.preload = "none";
    audioInstance._lfai = true;
  }
  return audioInstance;
}

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  current: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 0.7,
  isMuted: false,
  audio: getAudio(),
  queue: [],
  queueIndex: -1,

  playSong: (song, queue = []) => {
    const audio = getAudio();
    if (!audio) return;

    // Build queue including current song
    const fullQueue =
      queue.length > 0 ? queue : [song, ...get().queue.filter((q) => q !== song)];
    const index = fullQueue.findIndex(
      (q) => q.title === song.title && q.artist === song.artist,
    );

    audio.src = song.previewUrl;
    audio.volume = get().volume;
    audio.play().catch(() => {
      // Autoplay may be blocked; set state anyway
    });

    set({
      current: song,
      isPlaying: true,
      duration: song.duration || 30,
      progress: 0,
      queue: fullQueue,
      queueIndex: index >= 0 ? index : 0,
    });

    audio.ontimeupdate = () => {
      set({ progress: audio.currentTime, duration: audio.duration || song.duration || 30 });
    };
    audio.onended = () => {
      get().next();
    };
  },

  togglePlay: () => {
    const { isPlaying, current } = get();
    const audio = getAudio();
    if (!audio || !current) return;

    if (isPlaying) {
      audio.pause();
      set({ isPlaying: false });
    } else {
      audio.play().catch(() => {});
      set({ isPlaying: true });
    }
  },

  pause: () => {
    getAudio()?.pause();
    set({ isPlaying: false });
  },

resumePlayback: () => {
    getAudio()?.play().catch(() => {});
    set({ isPlaying: true });
  },

  seekTo: (time) => {
    const audio = getAudio();
    if (!audio) return;
    audio.currentTime = time;
    set({ progress: time });
  },

  setVolume: (vol) => {
    const audio = getAudio();
    if (audio) audio.volume = vol;
    set({ volume: vol, isMuted: vol === 0 });
  },

toggleMute: () => {
    const { isMuted } = get();
    const audio = getAudio();
    if (!audio) return;
    audio.muted = !isMuted;
    set({ isMuted: !isMuted });
  },

  next: () => {
    const { queue, queueIndex } = get();
    if (queue.length === 0) return;
    const nextIndex = (queueIndex + 1) % queue.length;
    const nextSong = queue[nextIndex];
    get().playSong(nextSong, queue);
    set({ queueIndex: nextIndex });
  },

  previous: () => {
    const { queue, queueIndex } = get();
    if (queue.length === 0) return;
    const prevIndex = (queueIndex - 1 + queue.length) % queue.length;
    const prevSong = queue[prevIndex];
    get().playSong(prevSong, queue);
    set({ queueIndex: prevIndex });
  },

  stop: () => {
    const audio = getAudio();
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    set({ isPlaying: false, progress: 0 });
  },

  close: () => {
    const audio = getAudio();
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    set({ current: null, isPlaying: false, progress: 0 });
  },
}));
