/**
 * Dashboard assembly for the ported HEIFA assessment.
 *
 * Orchestration only: it fetches through repositories and shapes the result for
 * the UI. The scoring rules themselves live in lib/domain/heifa.ts.
 */
import { findByUserId } from "@/lib/db/repositories/heifaRepository";
import { getImplicitUser } from "@/lib/db/repositories/userRepository";
import {
  HEIFA_CATEGORY_LABELS,
  HEIFA_CATEGORY_MAX,
  HEIFA_COMPONENT_CATEGORIES,
  HEIFA_TOTAL_MAX,
  type HeifaComponentCategory,
} from "@/lib/domain/heifa";
import type { HeifaAssessment, User } from "@/lib/types";

export interface HeifaComponentView {
  readonly category: HeifaComponentCategory;
  readonly label: string;
  readonly score: number;
  readonly max: number;
  /** 0-100, for the progress bar width. Clamped. */
  readonly percentage: number;
}

export interface HeifaDashboardView {
  readonly user: User;
  readonly totalScore: number;
  readonly totalMax: number;
  readonly totalPercentage: number;
  readonly components: readonly HeifaComponentView[];
  readonly context: HeifaAssessment["context"];
}

function percentage(score: number, max: number): number {
  if (max <= 0) return 0;

  return Math.min(Math.max((score / max) * 100, 0), 100);
}

/**
 * Build the dashboard view for the MVP's implicit user.
 *
 * Returns `null` when the user has no assessment, so the page can render an
 * empty state instead of throwing.
 */
export async function getHeifaDashboard(): Promise<HeifaDashboardView | null> {
  const user = await getImplicitUser();
  const assessment = await findByUserId(user.id);

  if (assessment === null) return null;

  const components = HEIFA_COMPONENT_CATEGORIES.map(
    (category): HeifaComponentView => {
      const score = assessment.scores[category];
      const max = HEIFA_CATEGORY_MAX[category];

      return {
        category,
        label: HEIFA_CATEGORY_LABELS[category],
        score,
        max,
        percentage: percentage(score, max),
      };
    },
  );

  const totalScore = assessment.scores.total;

  return {
    user,
    totalScore,
    totalMax: HEIFA_TOTAL_MAX,
    totalPercentage: percentage(totalScore, HEIFA_TOTAL_MAX),
    components,
    context: assessment.context,
  };
}
