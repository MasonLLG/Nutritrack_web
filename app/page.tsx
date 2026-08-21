import Link from "next/link";

import { Disclaimer } from "@/app/components/Disclaimer";
import { HeifaScorePanel } from "@/app/components/HeifaScorePanel";
import { InsightCard } from "@/app/components/InsightCard";
import { WeeklySummaryPanel } from "@/app/components/WeeklySummaryPanel";
import { getWeeklyAnalytics } from "@/lib/services/analytics";
import { getHeifaDashboard } from "@/lib/services/heifa";
import { getWeeklyInsight } from "@/lib/services/insights";

// Reads per-user data from the database, so it must not be statically
// prerendered at build time.
export const dynamic = "force-dynamic";

function EmptyState() {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-white/5">
      <h2 className="text-base font-medium">No assessment data yet</h2>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
        The HEIFA assessment for this user has not been imported. Run:
      </p>
      <pre className="mt-3 overflow-x-auto rounded-md bg-black/5 p-3 text-xs dark:bg-white/10">
        npm run db:migrate &amp;&amp; npm run db:seed
      </pre>
    </div>
  );
}

export default async function DashboardPage() {
  const [view, analytics, insight] = await Promise.all([
    getHeifaDashboard(),
    getWeeklyAnalytics(),
    getWeeklyInsight(),
  ]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">NutriTrack</h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            Dietary quality dashboard
          </p>
        </div>

        <Link
          href="/records"
          className="rounded-md border border-black/15 px-3 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          Nutrition records
        </Link>
      </header>

      <WeeklySummaryPanel analytics={analytics} />

      <InsightCard initial={insight} />

      {view === null ? <EmptyState /> : <HeifaScorePanel view={view} />}

      <Disclaimer />
    </main>
  );
}
