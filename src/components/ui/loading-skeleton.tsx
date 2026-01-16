import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

export function ProductCardSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
    >
      <div className="aspect-square animate-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 rounded bg-muted animate-shimmer" />
        <div className="h-5 w-3/4 rounded bg-muted animate-shimmer" />
        <div className="h-4 w-full rounded bg-muted animate-shimmer" />
        <div className="h-4 w-2/3 rounded bg-muted animate-shimmer" />
        <div className="flex items-center gap-2 pt-2">
          <div className="h-6 w-20 rounded bg-muted animate-shimmer" />
          <div className="h-4 w-14 rounded bg-muted animate-shimmer" />
        </div>
        <div className="h-10 w-full rounded-lg bg-muted animate-shimmer mt-4" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TextSkeleton({
  className,
  lines = 3,
}: LoadingSkeletonProps & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 rounded bg-muted animate-shimmer",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function AvatarSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "h-10 w-10 rounded-full bg-muted animate-shimmer",
        className
      )}
    />
  );
}

export function CardSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 space-y-4",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <AvatarSkeleton />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 rounded bg-muted animate-shimmer" />
          <div className="h-3 w-1/4 rounded bg-muted animate-shimmer" />
        </div>
      </div>
      <TextSkeleton />
    </div>
  );
}
