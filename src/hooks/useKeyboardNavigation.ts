import { useEffect } from "react";

interface KeyboardNavOptions<T> {
  items: T[];
  activeIndex: number;
  onSelect: (item: T, index: number) => void;
  onActiveChange: (index: number) => void;
  enabled?: boolean;
}

/**
 * Keyboard navigation hook for lists (used in search suggestions).
 * Supports ArrowUp, ArrowDown, and Enter keys.
 */
export function useKeyboardNavigation<T>({
  items,
  activeIndex,
  onSelect,
  onActiveChange,
  enabled = true,
}: KeyboardNavOptions<T>) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (items.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = (activeIndex + 1) % items.length;
        onActiveChange(next);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = (activeIndex - 1 + items.length) % items.length;
        onActiveChange(prev);
      } else if (e.key === "Enter") {
        if (activeIndex >= 0 && activeIndex < items.length) {
          e.preventDefault();
          onSelect(items[activeIndex], activeIndex);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, activeIndex, onSelect, onActiveChange, enabled]);
}
