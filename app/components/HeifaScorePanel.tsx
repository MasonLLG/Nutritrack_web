import type { HeifaDashboardView } from "@/lib/services/heifa";

function formatScore(value: number): string {
  // Scores are stored to 2dp but are usually whole or half values.
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function ScoreBar({ percentage }: { percentage: number }) {
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10"
      role="presentation"
    >
      <div
        className="h-full rounded-full bg-emerald-600 dark:bg-emerald-400"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export function HeifaScorePanel({ view }: { view: HeifaDashboardView }) {
  return (
    <section aria-labelledby="heifa-heading" className="flex flex-col gap-6">
      <div className="rounded-xl border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-white/5">
        <h2
          id="heifa-heading"
          className="text-sm font-medium text-black/60 dark:text-white/60"
        >
          Total HEIFA score
        </h2>

        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-semibold tabular-nums">
            {formatScore(view.totalScore)}
          </span>
          <span className="text-lg text-black/50 dark:text-white/50">
            / {view.totalMax}
          </span>
        </p>

        <div className="mt-4">
          <ScoreBar percentage={view.totalPercentage} />
        </div>

        <p className="mt-3 text-xs text-black/50 dark:text-white/50">
          Scored for {view.user.username} ({view.user.sex}). The 13 component
          scores below sum to this total.
        </p>
      </div>

      <div className="rounded-xl border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-white/5">
        <h3 className="text-sm font-medium text-black/60 dark:text-white/60">
          Component scores
        </h3>

        <ul className="mt-4 flex flex-col gap-4">
          {view.components.map((component) => (
            <li key={component.category}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm">{component.label}</span>
                <span className="text-sm tabular-nums text-black/60 dark:text-white/60">
                  {formatScore(component.score)} / {component.max}
                </span>
              </div>
              <div className="mt-1.5">
                <ScoreBar percentage={component.percentage} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
