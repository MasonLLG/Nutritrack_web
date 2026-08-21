import Link from "next/link";
import { Suspense } from "react";

import { Disclaimer } from "@/app/components/Disclaimer";
import { HeifaScorePanel } from "@/app/components/HeifaScorePanel";
import { InsightCard } from "@/app/components/InsightCard";
import { SetupRequired } from "@/app/components/SetupRequired";
import { InsightSkeleton } from "@/app/components/Skeleton";
import { WeeklySummaryPanel } from "@/app/components/WeeklySummaryPanel";
import { SetupRequiredError } from "@/lib/domain/errors";
import { getWeeklyAnalytics } from "@/lib/services/analytics";
import { getHeifaDashboard } from "@/lib/services/heifa";
import { getWeeklyInsight } from "@/lib/services/insights";

// Reads per-user data from the database, so it must not be statically
// prerendered at build time.
export const dynamic = "force-dynamic";

function PageShell({ children }: { children: React.ReactNode }) {
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

      {children}
    </main>
  );
}

/**
 * Streamed separately from the rest of the page.
 *
 * Generating the summary can call OpenAI, which is slow enough (seconds) to
 * hold up the entire dashboard if awaited alongside the database reads. The
 * Suspense boundary lets the chart and scores paint immediately while this
 * arrives.
 */
async function WeeklyInsightSection() {
  const insight = await getWeeklyInsight();

  return <InsightCard initial={insight} />;
}

export default async function DashboardPage() {
  let view: Awaited<ReturnType<typeof getHeifaDashboard>>;
  let analytics: Awaited<ReturnType<typeof getWeeklyAnalytics>>;

  try {
    [view, analytics] = await Promise.all([
      getHeifaDashboard(),
      getWeeklyAnalytics(),
    ]);
  } catch (error) {
    // An unseeded database is an expected first-run state with a known remedy,
    // not a crash. Anything else is a real fault: let the error boundary have it.
    if (error instanceof SetupRequiredError) {
      return (
        <PageShell>
          <SetupRequired remedy={error.remedy} />
        </PageShell>
      );
    }

    throw error;
  }

  return (
    <PageShell>
      <WeeklySummaryPanel analytics={analytics} />

      <Suspense fallback={<InsightSkeleton />}>
        <WeeklyInsightSection />
      </Suspense>

      {view === null ? (
        <SetupRequired remedy="npm run db:seed" />
      ) : (
        <HeifaScorePanel view={view} />
      )}

      <Disclaimer />
    </PageShell>
  );
}
