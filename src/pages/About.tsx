import { useNavigate } from "react-router-dom";
import { Sparkles, Music, Mic, Heart, Shield, Zap } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_VERSION } from "@/constants";

const features = [
  { icon: Mic, title: "Song Recognition", desc: "Tap to listen — identify the song playing near you in seconds." },
  { icon: Music, title: "Lyrics", desc: "Instant lyrics from multiple providers with automatic fallback." },
  { icon: Sparkles, title: "Smart Search", desc: "Find any song or artist with instant, debounced suggestions." },
  { icon: Heart, title: "Favorites", desc: "Save songs, artists, and albums for quick access." },
  { icon: Shield, title: "Privacy-First", desc: "All data is stored locally in your browser. No tracking." },
  { icon: Zap, title: "Fast & Responsive", desc: "Optimized for speed with lazy-loaded pages and React Query." },
];

export function About() {
  useDocumentTitle("About");
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mb-6 flex justify-center">
          <Logo size="lg" showText={false} />
        </div>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-foreground sm:text-5xl">
          About <span className="text-gradient-green">{APP_NAME}</span>
        </h1>
        <p className="mx-auto max-w-2xl text-secondary-text sm:text-lg">
          {APP_NAME} is a modern song discovery app that identifies songs from
          your microphone or searches by title and artist — with instant
          previews, album details, and lyrics — in a beautiful interface.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted">
          <span>Version {APP_VERSION}</span>
          <span>·</span>
          <span>Built with React 19 + TypeScript</span>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <f.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-1 font-semibold text-foreground">{f.title}</h3>
            <p className="text-sm text-secondary-text">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-3xl border border-border bg-gradient-to-br from-primary/20 via-card to-card p-8 text-center sm:p-12">
        <h2 className="mb-2 text-2xl font-bold text-foreground">Ready to find a song?</h2>
        <p className="mb-6 text-secondary-text">
          Tap to listen, play any song, and identify it instantly.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => navigate("/")}>Start Listening</Button>
          <Button variant="outline" onClick={() => navigate("/search?q=pop")}>
            Try a Search
          </Button>
        </div>
      </div>

      {/* Data sources */}
      <div className="mt-12 text-center">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-secondary-text">
          Powered By
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {["Deezer", "iTunes", "Last.fm", "Lyrics.ovh", "LRC Lib"].map((s) => (
            <span
              key={s}
              className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-secondary-text"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
