import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface UIState {
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  fullscreenLyrics: boolean;
  setFullscreenLyrics: (v: boolean) => void;
}

const UIContext = createContext<UIState | undefined>(undefined);

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

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
