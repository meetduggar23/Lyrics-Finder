import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Hero } from "@/components/feature/hero/Hero";
import { TrendingSongs } from "@/components/feature/landing/TrendingSongs";
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
            className="mx-auto flex max-w-xl items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by song title or artist…"
                className="h-13 w-full rounded-full border border-border bg-card pl-12 pr-4 text-sm text-foreground placeholder:text-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-13 shrink-0 items-center rounded-full bg-primary px-6 font-semibold text-black transition-colors hover:bg-primary-hover"
            >
              Search
            </button>
          </form>
        </section>
      </div>

      <TrendingSongs />
      <HowItWorks />
      <FeaturesSection />
    </div>
  );
}
