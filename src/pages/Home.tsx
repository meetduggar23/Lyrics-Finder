import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Hero } from "@/components/feature/hero/Hero";
import { HowItWorks } from "@/components/feature/landing/HowItWorks";
import { FeaturesSection } from "@/components/feature/landing/FeaturesSection";

export function Home() {
  useDocumentTitle();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="pb-10">
      <Hero />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Manual search */}
        <section id="manual-search" className="mt-12 scroll-mt-24">
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto flex max-w-[760px] items-center gap-3"
          >
            <div className="group relative flex-1">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/80 transition-colors group-focus-within:text-primary" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by song title or artist…"
                className="h-14 w-full rounded-2xl border border-border bg-white/70 pl-12 pr-5 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md transition-all placeholder:text-muted hover:border-border focus:border-primary/50 focus:shadow-[0_0_0_4px_rgba(29,69,51,0.12),inset_0_1px_0_rgba(255,255,255,0.7)] focus:outline-none focus:placeholder:text-foreground/60"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-14 shrink-0 items-center rounded-2xl bg-primary px-8 font-semibold text-[#F7EAE0] shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover hover:shadow-primary/30 active:scale-95"
            >
              Search
            </button>
          </form>
        </section>
      </div>

      <HowItWorks />
      <FeaturesSection />
    </div>
  );
}
