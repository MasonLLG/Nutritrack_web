/** Neutral placeholder blocks used by loading states. */
export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-md bg-black/10 dark:bg-white/10 ${className}`}
    />
  );
}

export function SkeletonCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-white/5">
      {children}
    </div>
  );
}

/** Matches the InsightCard's shape so streaming in does not shift the layout. */
export function InsightSkeleton() {
  return (
    <SkeletonCard>
      <span className="sr-only" role="status">
        Generating weekly summary…
      </span>
      <SkeletonBlock className="h-4 w-32" />
      <SkeletonBlock className="h-3 w-56" />
      <div className="mt-2 flex flex-col gap-2">
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-4/5" />
      </div>
    </SkeletonCard>
  );
}
