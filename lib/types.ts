/**
 * Domain and DTO types shared across layers.
 *
 * These are hand-written rather than generated, and are intentionally distinct
 * from the raw driver row shapes in lib/db/rows.ts. UI and services depend on
 * these; only the repositories know about rows.
 */
import type { HeifaCategory, Sex } from "@/lib/domain/heifa";

export type { HeifaCategory, Sex };

export interface User {
  readonly id: number;
  readonly uid: string;
  readonly username: string;
  readonly sex: Sex;
  readonly phoneNumber: string;
  readonly persona: string | null;
  readonly mealTime: string | null;
  readonly sleepTime: string | null;
  readonly wakeTime: string | null;
  readonly foodPreferences: string | null;
}

/**
 * The ported HEIFA assessment: one per user, sex already resolved.
 * `scores` holds the 13 category scores; `context` holds the serve sizes and
 * raw intake values kept for dashboard display.
 */
export interface HeifaAssessment {
  readonly userId: number;
  readonly scores: Readonly<Record<HeifaCategory, number>>;
  readonly context: {
    readonly discretionaryServeSize: number | null;
    readonly vegetablesServeSize: number | null;
    readonly fruitServeSize: number | null;
    readonly grainsCerealsServeSize: number | null;
    readonly wholegrainsServeSize: number | null;
    readonly meatAlternativesServeSize: number | null;
    readonly dairyAlternativesServeSize: number | null;
    readonly sodiumMg: number | null;
    readonly alcoholStandardDrinks: number | null;
    readonly waterTotalMl: number | null;
    readonly sugarGrams: number | null;
    readonly saturatedFatGrams: number | null;
  };
}

export type NutritionRecordSource = "manual" | "fruityvice";

export interface NutritionRecord {
  readonly id: number;
  readonly userId: number;
  readonly foodName: string;
  readonly heifaCategory: HeifaCategory | null;
  readonly servingQty: number;
  readonly servingUnit: string;
  readonly calories: number;
  readonly proteinG: number;
  readonly carbsG: number;
  readonly fatG: number;
  readonly sugarG: number;
  readonly source: NutritionRecordSource;
  readonly fruityviceId: number | null;
  /** Full timestamp of consumption. */
  readonly consumedAt: Date;
  /** Calendar day as `YYYY-MM-DD`, written by the app, not derived by MySQL. */
  readonly consumedOn: string;
}

/** Fields accepted when creating a record; the rest are assigned by the layer. */
export interface NewNutritionRecord {
  readonly userId: number;
  readonly foodName: string;
  readonly heifaCategory: HeifaCategory | null;
  readonly servingQty: number;
  readonly servingUnit: string;
  readonly calories: number;
  readonly proteinG: number;
  readonly carbsG: number;
  readonly fatG: number;
  readonly sugarG: number;
  readonly source: NutritionRecordSource;
  readonly fruityviceId: number | null;
  readonly consumedAt: Date;
  readonly consumedOn: string;
}
