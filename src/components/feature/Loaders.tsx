import { Skeleton } from "@/components/ui/skeleton";

export function SongCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <Skeleton className="mb-3 aspect-square w-full" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function ArtistCardSkeleton() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center">
      <Skeleton className="mb-4 h-24 w-24 rounded-full" />
      <Skeleton className="mb-2 h-4 w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function AlbumCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <Skeleton className="mb-3 aspect-square w-full" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <SongCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="mb-3 h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <CardGridSkeleton count={8} />
    </div>
  );
}

export function LyricsSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i % 3 === 0 ? "w-3/4" : i % 3 === 1 ? "w-2/3" : "w-5/6"}`}
        />
      ))}
    </div>
  );
}
