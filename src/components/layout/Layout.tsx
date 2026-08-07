import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SearchBar } from "@/components/layout/SearchBar";
import { MusicPlayer } from "@/components/feature/MusicPlayer";
import { Toaster } from "@/components/ui/toast";
import { useUI } from "@/context/UIContext";
import { usePlayerStore } from "@/store/player";

export function Layout() {
const location = useLocation();
  useUI();
  const current = usePlayerStore((s) => s.current);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <SearchBar />
      <MusicPlayer />
      <Toaster />
      {/* Add bottom padding when player is active */}
      {current && <div className="h-24" aria-hidden="true" />}
    </div>
  );
}
