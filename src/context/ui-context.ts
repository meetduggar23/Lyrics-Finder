import { createContext } from "react";

export interface UIState {
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  fullscreenLyrics: boolean;
  setFullscreenLyrics: (v: boolean) => void;
}

export const UIContext = createContext<UIState | undefined>(undefined);
