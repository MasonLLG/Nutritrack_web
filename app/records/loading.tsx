import { SkeletonBlock } from "@/app/components/Skeleton";

export default function RecordsLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <span className="sr-only" role="status">
        Loading records…
      </span>

      <header className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-7 w-56" />
          <SkeletonBlock className="h-4 w-40" />
        </div>
        <SkeletonBlock className="h-9 w-28" />
      </header>

      {[0, 1, 2].map((group) => (
        <div key={group} className="flex flex-col gap-2">
          <SkeletonBlock className="h-4 w-28" />
          <div className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/15">
            {[0, 1, 2].map((row) => (
              <SkeletonBlock key={row} className="h-10 w-full" />
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
