"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary.
 *
 * Shows a generic message: the underlying error may name the database, a
 * connection string, or an upstream service, none of which belongs in front of
 * a user. The detail is logged instead.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] render failed:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>

      <p className="text-sm text-black/60 dark:text-white/60">
        The page could not be loaded. This is usually the database being
        unreachable — check that MySQL is running and that{" "}
        <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
          DATABASE_URL
        </code>{" "}
        in <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">.env</code>{" "}
        is correct, then try again.
      </p>

      {error.digest !== undefined && (
        <p className="text-xs text-black/45 dark:text-white/45">
          Reference: {error.digest}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400"
        >
          Try again
        </button>
        <a
          href="/api/health"
          className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          Check database status
        </a>
      </div>
    </main>
  );
}
