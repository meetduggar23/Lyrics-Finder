import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, Home, Heart, Info, AudioLines } from "lucide-react";
import { cn } from "@/utils/cn";
import { Logo } from "@/components/common/Logo";
import { useUI } from "@/context/useUI";
import { useIsMobile } from "@/hooks/useMediaQuery";

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Listen", path: "/detect", icon: AudioLines },
  { label: "Favorites", path: "/favorites", icon: Heart },
  { label: "About", path: "/about", icon: Info },
];

export function Navbar() {
  const { openSearch, mobileNavOpen, openMobileNav, closeMobileNav } = useUI();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
        className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#090B0A]"
      >
        <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6">
          <Logo dark />

          {/* Desktop Nav */}
          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Primary"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "bg-[rgba(29,185,84,0.08)] text-[#1DB954]"
                      : "text-[#A7A7A7] hover:bg-white/[0.05] hover:text-[#F5F5F5]",
                  )
                }
              >
                <item.icon
                  className="h-4 w-4"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Search field — opens the search overlay */}
            <button
              onClick={openSearch}
              className="flex h-11 w-[160px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm text-[#A7A7A7] transition-colors duration-200 hover:border-[#1DB954]/40 hover:text-[#F5F5F5] sm:w-[175px]"
              aria-label="Search"
            >
              <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span className="truncate">Search…</span>
            </button>
            {isMobile && (
              <button
                onClick={openMobileNav}
                className="flex h-11 w-11 items-center justify-center rounded-[10px] text-[#A7A7A7] transition-colors duration-200 hover:bg-white/[0.05] hover:text-[#F5F5F5]"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" strokeWidth={1.75} />
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
              className="fixed left-0 top-0 z-[91] flex h-full w-72 flex-col border-r border-white/[0.08] bg-[#0A0C0B] p-4 shadow-2xl lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <Logo dark />
                <button
                  onClick={closeMobileNav}
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[#A7A7A7] hover:bg-white/[0.05] hover:text-[#F5F5F5]"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className="flex items-center gap-3 rounded-[10px] px-3 py-3 text-sm font-medium text-[#A7A7A7] transition-colors duration-200 hover:bg-white/[0.05] hover:text-[#F5F5F5]"
                  >
                    <item.icon className="h-5 w-5" strokeWidth={1.75} />
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-auto border-t border-white/[0.08] pt-4">
                <button
                  onClick={() => {
                    closeMobileNav();
                    openSearch();
                  }}
                  className="flex items-center gap-2 text-sm text-[#1DB954] hover:text-[#3BE080]"
                >
                  <Search className="h-4 w-4" strokeWidth={1.75} />
                  Search songs…
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
