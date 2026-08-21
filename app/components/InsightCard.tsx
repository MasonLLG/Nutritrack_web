"use client";

import { useState } from "react";

import { Disclaimer } from "@/app/components/Disclaimer";
import type { InsightSource, WeeklyInsight } from "@/lib/services/insights";

/**
 * Provenance is always shown. A reader must be able to tell whether they are
 * looking at generated prose or a deterministic calculation.
 */
const SOURCE_LABEL: Record<InsightSource, string> = {
  ai: "AI-generated",
  fallback: "Rule-based summary",
  fallback_after_rejection: "Rule-based summary",
};

export function InsightCard({ initial }: { initial: WeeklyInsight }) {
  const [insight, setInsight] = useState<WeeklyInsight>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function regenerate() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/insights/weekly", { method: "POST" });

      if (!response.ok) {
        setError("Could not generate a summary. Please try again.");
        return;
      }

      setInsight((await response.json()) as WeeklyInsight);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      aria-labelledby="insight-heading"
      className="flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-white/5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 id="insight-heading" className="text-sm font-medium">
            Weekly summary
          </h2>
          <p className="text-xs text-black/50 dark:text-white/50">
            {insight.startDate} to {insight.endDate} ·{" "}
            {SOURCE_LABEL[insight.source]}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void regenerate()}
          disabled={loading}
          className="rounded-md border border-black/15 px-3 py-1.5 text-xs font-medium hover:bg-black/5 disabled:opacity-60 dark:border-white/20 dark:hover:bg-white/10"
        >
          {loading ? "Generating…" : "Regenerate"}
        </button>
      </div>

      <p className="text-sm leading-relaxed">{insight.summary}</p>

      {error !== null && (
        <p role="alert" className="text-xs text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <Disclaimer>
        This summary describes logged entries only. It is not medical advice and
        does not provide diagnosis or treatment recommendations.
      </Disclaimer>
    </section>
  );
}
