import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  viewAllLink,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-5 flex items-end justify-between gap-4",
        className,
      )}
    >
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-secondary-text">{subtitle}</p>
        )}
      </div>
      {viewAllLink && (
        <Link
          to={viewAllLink}
          className="group flex shrink-0 items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
        >
          View all
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
