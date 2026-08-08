import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { APP_NAME } from "@/constants";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  /** Dark navbar variant: light brand text + bright green icon. */
  dark?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function Logo({ className, showText = true, size = "md", dark = false }: LogoProps) {
  return (
    <Link
      to="/"
      className={cn("group flex items-center gap-2.5", className)}
      aria-label={`${APP_NAME} home`}
    >
      <motion.div
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={cn(
          "flex items-center justify-center rounded-xl transition-shadow",
          sizeClasses[size],
          dark
            ? "bg-[#1DB954]"
            : "bg-primary shadow-lg shadow-primary/30 group-hover:shadow-primary/50",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={cn(
            "h-[60%] w-[60%]",
            dark ? "text-[#0A0C0B]" : "text-[#F7EAE0]",
          )}
          aria-hidden="true"
        >
          <path
            d="M9 18V5l12-2v13"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="18" r="3" fill="currentColor" />
          <circle cx="18" cy="16" r="3" fill="currentColor" />
        </svg>
      </motion.div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "text-lg font-extrabold tracking-tight",
              dark ? "text-[#F5F5F5]" : "text-foreground",
            )}
          >
            Lyrics Finder
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.2em]",
              dark ? "text-[#1DB954]" : "text-primary",
            )}
          >
            AI
          </span>
        </div>
      )}
    </Link>
  );
}
