import { motion } from "framer-motion";
import { Download, Music2 } from "lucide-react";
import type { Lyrics } from "@/types";
import { cn } from "@/utils/cn";
import {
  parseLyricsToBlocks,
  isInstrumental,
  countWords,
  estimateReadingTime,
} from "@/utils/lyrics";
import { downloadLyrics } from "@/utils/download";
import { useSettingsStore } from "@/store/settings";
import { DEFAULT_FONT_SIZES } from "@/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { toastSuccess } from "@/store/toast";

interface LyricsViewerProps {
  title: string;
  artist: string;
  lyrics: Lyrics;
  loading?: boolean;
}

export function LyricsViewer({
  title,
  artist,
  lyrics,
  loading,
}: LyricsViewerProps) {
  const fontSize = useSettingsStore((s) => s.settings.fontSize);
  const fontClass = DEFAULT_FONT_SIZES[fontSize];

  if (loading) {
    return (
      <div className={cn("whitespace-pre-wrap leading-relaxed text-secondary-text", fontClass)}>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`h-4 bg-border/50 rounded ${i % 3 === 0 ? "w-3/4" : i % 3 === 1 ? "w-2/3" : "w-full"}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!lyrics.lyrics || lyrics.source === "none") {
    return (
      <EmptyState
        icon={<Music2 className="h-8 w-8 text-primary" />}
        title="No lyrics found"
        description="We couldn't find lyrics for this song. Try a different source or check back later."
      />
    );
  }

  if (isInstrumental(lyrics.lyrics)) {
    return (
      <div className="py-16 text-center">
        <Badge variant="default" className="mb-4">Instrumental</Badge>
        <p className="text-secondary-text">This track appears to be instrumental.</p>
      </div>
    );
  }

  const blocks = parseLyricsToBlocks(lyrics.lyrics);
  const wordCount = countWords(lyrics.lyrics);
  const readTime = estimateReadingTime(lyrics.lyrics);

  const handleDownload = () => {
    downloadLyrics(title, artist, lyrics.lyrics);
    toastSuccess("Lyrics downloaded", `${title} - ${artist}.txt`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl border border-border bg-card/50 p-6 sm:p-8"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Badge variant={lyrics.synced ? "success" : "secondary"}>
            {lyrics.synced ? "Synced" : "Plain"} · {lyrics.source.toUpperCase()}
          </Badge>
          <span className="text-xs text-muted">
            {wordCount} words · {readTime} min read
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      <div className={cn("space-y-6", fontClass)}>
        {blocks.map((block, i) => (
          <div key={i} className="space-y-2">
            {block.map((line, j) => (
              <p
                key={j}
                className="leading-relaxed text-foreground transition-colors hover:text-primary"
              >
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
