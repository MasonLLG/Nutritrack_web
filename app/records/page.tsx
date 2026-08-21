import Link from "next/link";

import { RecordList } from "@/app/components/RecordList";
import { SetupRequired } from "@/app/components/SetupRequired";
import { SetupRequiredError } from "@/lib/domain/errors";
import { listRecentRecords, sumMacros } from "@/lib/services/nutrition";

export const dynamic = "force-dynamic";

export default async function RecordsPage() {
  let records: Awaited<ReturnType<typeof listRecentRecords>>;

  try {
    records = await listRecentRecords(200);
  } catch (error) {
    if (error instanceof SetupRequiredError) {
      return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10">
          <h1 className="text-2xl font-semibold">Nutrition records</h1>
          <SetupRequired remedy={error.remedy} />
        </main>
      );
    }

    throw error;
  }

  const totals = sumMacros(records);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Nutrition records</h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            {records.length} record{records.length === 1 ? "" : "s"} ·{" "}
            {Math.round(totals.calories)} kcal total
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-black/60 underline-offset-4 hover:underline dark:text-white/60"
          >
            Dashboard
          </Link>
          <Link
            href="/records/new"
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400"
          >
            Add record
          </Link>
        </div>
      </header>

      <RecordList records={records} />
    </main>
  );
}
