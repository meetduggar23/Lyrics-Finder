import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, Home, Compass, Heart, History, Settings as SettingsIcon, Info } from "lucide-react";
import { cn } from "@/utils/cn";
import { Logo } from "@/components/common/Logo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useUI } from "@/context/UIContext";
import { useTheme } from "@/hooks/useTheme";
import { useIsMobile } from "@/hooks/useMediaQuery";

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Discover", path: "/discover", icon: Compass },
  { label: "Favorites", path: "/favorites", icon: Heart },
  { label: "History", path: "/history", icon: History },
  { label: "Settings", path: "/settings", icon: SettingsIcon },
  { label: "About", path: "/about", icon: Info },
];

export function Navbar() {
  const { openSearch, mobileNavOpen, openMobileNav, closeMobileNav } = useUI();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  useTheme();

  const handleNavClick = (path: string) => {
    closeMobileNav();
    navigate(path);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="glass sticky top-0 z-50 border-b border-border"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-secondary-text hover:bg-card hover:text-foreground",
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={openSearch}
              className="flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm text-secondary-text transition-colors hover:border-primary/40 hover:text-primary"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search…</span>
            </button>
            <ThemeToggle />
            {isMobile && (
              <button
                onClick={openMobileNav}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-secondary-text transition-colors hover:text-primary"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileNav}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-[91] flex h-full w-72 flex-col bg-card/95 p-4 shadow-2xl backdrop-blur-xl lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <Logo />
                <button
                  onClick={closeMobileNav}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-secondary-text hover:text-primary"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-secondary-text transition-colors hover:bg-border/40 hover:text-foreground"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-auto border-t border-border pt-4">
                <Link to="/discover" onClick={closeMobileNav} className="text-sm text-primary hover:underline">
                  Explore Music →
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
