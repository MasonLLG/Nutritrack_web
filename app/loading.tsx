import { InsightSkeleton, SkeletonBlock, SkeletonCard } from "@/app/components/Skeleton";

export default function DashboardLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <span className="sr-only" role="status">
        Loading dashboard…
      </span>

      <header className="flex flex-col gap-2">
        <SkeletonBlock className="h-7 w-40" />
        <SkeletonBlock className="h-4 w-56" />
      </header>

      <SkeletonCard>
        <SkeletonBlock className="h-4 w-48" />
        <SkeletonBlock className="h-3 w-64" />
        <SkeletonBlock className="mt-2 h-40 w-full" />
      </SkeletonCard>

      <InsightSkeleton />

      <SkeletonCard>
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="h-10 w-40" />
        <SkeletonBlock className="h-2 w-full" />
      </SkeletonCard>
    </main>
  );
}
