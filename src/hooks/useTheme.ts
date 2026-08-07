import { useEffect } from "react";
import { useSettingsStore } from "@/store/settings";

/**
 * Applies the theme (dark/light) to the document root element.
 */
export function useTheme() {
  const theme = useSettingsStore((s) => s.settings.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
    // Set theme-color meta
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#0A0A0A" : "#ffffff");
  }, [theme]);

  return theme;
}
