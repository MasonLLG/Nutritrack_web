import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-black/60 dark:text-white/60">
        That page does not exist.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400"
        >
          Dashboard
        </Link>
        <Link
          href="/records"
          className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          Nutrition records
        </Link>
      </div>
    </main>
  );
}
