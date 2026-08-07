import { Link } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { APP_NAME, APP_VERSION } from "@/constants";

const footerLinks = [
  { label: "Home", path: "/" },
  { label: "Listen", path: "/detect" },
  { label: "Favorites", path: "/favorites" },
  { label: "History", path: "/history" },
  { label: "Settings", path: "/settings" },
  { label: "About", path: "/about" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Logo showText={false} />
            <p className="max-w-xs text-center text-sm text-secondary-text md:text-left">
              Discover lyrics, explore artists, and feel the music — all in one
              place.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label="Footer">
            {footerLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm text-secondary-text transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-xs text-muted md:flex-row">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p>
            Data provided by Deezer, iTunes, Last.fm, Lyrics.ovh, and LRC Lib.
          </p>
          <p>v{APP_VERSION}</p>
        </div>
      </div>
    </footer>
  );
}
