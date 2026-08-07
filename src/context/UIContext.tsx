import { useState, useCallback, type ReactNode } from "react";
import { UIContext } from "@/context/ui-context";

export function UIProvider({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [fullscreenLyrics, setFullscreenLyrics] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <UIContext.Provider
      value={{
        searchOpen,
        openSearch,
        closeSearch,
        mobileNavOpen,
        openMobileNav,
        closeMobileNav,
        fullscreenLyrics,
        setFullscreenLyrics,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}
