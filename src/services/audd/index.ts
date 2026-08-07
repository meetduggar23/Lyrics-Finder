import { auddClient } from "@/api/client";
import { AUDD_API_TOKEN } from "@/constants";
import type { DetectedSong } from "@/types";

/**
 * AudD music recognition service.
 * Identifies songs from microphone recordings or uploaded audio files.
 * Falls back to a demo result when no API token is configured.
 */

interface AudDResult {
  artist?: string;
  title?: string;
  album?: string;
  release_date?: string;
  song_id?: string;
  duration?: number;
  cover_art?: { url?: string } | string;
}

interface AudDResponse {
  status: "success" | "error";
  result?: AudDResult;
  error?: { error_code?: number; error_message?: string };
}

export const hasAuddKey = Boolean(AUDD_API_TOKEN);

const DEMO_SONG: DetectedSong = {
  title: "Blinding Lights",
  artist: "The Weeknd",
  album: "After Hours",
  releaseDate: "2019-11-29",
  duration: 200,
  coverUrl:
    "https://e-cdns-images.dzcdn.net/images/cover/275aa53ec2a2aa57a87f4f4d1c1d1f04/500x500-000000-80-0-0.jpg",
  fromDemo: true,
};

function mapResult(result: AudDResult): DetectedSong {
  const cover = typeof result.cover_art === "string" ? result.cover_art : result.cover_art?.url;
  return {
    title: result.title || "Unknown Track",
    artist: result.artist || "Unknown Artist",
    album: result.album,
    releaseDate: result.release_date,
    coverUrl: cover,
    duration: result.duration,
    songId: result.song_id,
  };
}

/**
 * Recognize a song from an audio blob (mic recording or uploaded file).
 */
export async function recognizeAudio(
  blob: Blob,
  filename = "recording.webm",
): Promise<DetectedSong> {
  if (!AUDD_API_TOKEN) {
    await new Promise((r) => setTimeout(r, 2000));
    return DEMO_SONG;
  }

  const form = new FormData();
  form.append("api_token", AUDD_API_TOKEN);
  form.append("file", blob, filename);
  form.append("return", "deezer");

  const { data } = await auddClient.post<AudDResponse>("/", form);

  if (data.status === "error" || !data.result) {
    throw new Error(
      data.error?.error_message || "Could not identify the song. Try again with clearer audio.",
    );
  }

  return mapResult(data.result);
}
