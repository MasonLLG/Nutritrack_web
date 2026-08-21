import Link from "next/link";

import { Disclaimer } from "@/app/components/Disclaimer";
import { RecordForm } from "@/app/components/RecordForm";

export default function NewRecordPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-1">
        <Link
          href="/records"
          className="text-sm text-black/60 underline-offset-4 hover:underline dark:text-white/60"
        >
          ← Back to records
        </Link>
        <h1 className="text-2xl font-semibold">Add a record</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Enter the nutrition values for what you ate.
        </p>
      </header>

      <RecordForm />

      <Disclaimer />
    </main>
  );
}
