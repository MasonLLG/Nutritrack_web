/** Shown when the database is reachable but not yet seeded. */
export function SetupRequired({ remedy }: { remedy: string }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-white/5">
      <h2 className="text-base font-medium">Set up the database</h2>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
        The database is reachable but has no data yet. Run this from the project
        root, then reload:
      </p>
      <pre className="mt-3 overflow-x-auto rounded-md bg-black/5 p-3 text-xs dark:bg-white/10">
        {remedy}
      </pre>
    </div>
  );
}
