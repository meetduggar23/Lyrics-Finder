import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: "left" | "right" | "bottom";
  className?: string;
}

const sideClasses = {
  left: "left-0 top-0 h-full w-full max-w-sm border-r border-border",
  right: "right-0 top-0 h-full w-full max-w-sm border-l border-border",
  bottom:
    "bottom-0 left-0 w-full max-h-[80vh] border-t border-border rounded-t-2xl",
};

const initialClasses = {
  left: { x: "-100%" },
  right: { x: "100%" },
  bottom: { y: "100%" },
};

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  className,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[99] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              "fixed z-[100] flex flex-col bg-card/95 backdrop-blur-xl shadow-2xl",
              sideClasses[side],
              className,
            )}
            initial={initialClasses[side]}
            animate={{ x: 0, y: 0 }}
            exit={initialClasses[side]}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {(title || true) && (
              <div className="flex items-center justify-between border-b border-border p-5">
                <h2 className="text-lg font-bold text-foreground">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-secondary-text transition-colors hover:bg-border/40 hover:text-foreground"
                  aria-label="Close drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
