import * as React from "react";
import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({});
  const triggerRef = useRef<HTMLDivElement>(null);

  const position = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 8;
    let pos: Record<string, number> = {};
    if (side === "top") pos = { left: rect.left + rect.width / 2, top: rect.top - gap };
    if (side === "bottom") pos = { left: rect.left + rect.width / 2, top: rect.bottom + gap };
    if (side === "left") pos = { left: rect.left - gap, top: rect.top + rect.height / 2 };
    if (side === "right") pos = { left: rect.right + gap, top: rect.top + rect.height / 2 };
    setCoords(pos);
  }, [side]);

  useEffect(() => {
    if (visible) position();
  }, [visible, position]);

return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={() => {
        position();
        setVisible(true);
      }}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => {
        position();
        setVisible(true);
      }}
      onBlur={() => setVisible(false)}
    >
      {children}
      <div
        style={coords as React.CSSProperties}
        className={cn(
          "pointer-events-none fixed z-[100] whitespace-nowrap rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground shadow-lg transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0",
          className,
        )}
      >
        {content}
      </div>
    </div>
  );
}
