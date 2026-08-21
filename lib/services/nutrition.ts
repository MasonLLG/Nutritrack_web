/**
 * Food-log application service.
 *
 * Owns the rules for creating and listing nutrition records. Route handlers
 * validate with the schema exported here and then call one of these functions;
 * they contain no logic of their own.
 */
import { z } from "zod";

import {
  insert,
  listByUser,
} from "@/lib/db/repositories/nutritionRecordRepository";
import { getImplicitUser } from "@/lib/db/repositories/userRepository";
import { toLocalDateString } from "@/lib/domain/date";
import { HEIFA_COMPONENT_CATEGORIES } from "@/lib/domain/heifa";
import type { NutritionRecord } from "@/lib/types";

/** Upper bounds are sanity limits, not nutritional advice. */
const MAX_SERVING_QTY = 10_000;
const MAX_MACRO_GRAMS = 10_000;
const MAX_CALORIES = 100_000;

const macro = z.number().min(0).max(MAX_MACRO_GRAMS).default(0);

export const createRecordSchema = z.object({
  foodName: z.string().trim().min(1, "Food name is required").max(200),
  heifaCategory: z.enum(HEIFA_COMPONENT_CATEGORIES).nullable().default(null),
  servingQty: z
    .number()
    .positive("Serving quantity must be greater than zero")
    .max(MAX_SERVING_QTY),
  servingUnit: z.string().trim().min(1, "Serving unit is required").max(32),
  calories: z.number().min(0).max(MAX_CALORIES).default(0),
  proteinG: macro,
  carbsG: macro,
  fatG: macro,
  sugarG: macro,
  source: z.enum(["manual", "fruityvice"]).default("manual"),
  fruityviceId: z.number().int().positive().nullable().default(null),
  /** ISO timestamp. Defaults to now when the client does not supply one. */
  consumedAt: z.coerce.date().optional(),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;

/**
 * Normalise a serving unit for consistent grouping and display.
 *
 * Lower-cased and whitespace-collapsed so "Cup", "cup" and " cup " are one
 * unit. Deliberately no pluralisation or unit conversion — inventing a
 * conversion table would be guessing at what the user meant.
 */
export function normaliseServingUnit(unit: string): string {
  return unit.trim().replace(/\s+/g, " ").toLowerCase();
}

export async function createNutritionRecord(
  input: CreateRecordInput,
): Promise<NutritionRecord> {
  const user = await getImplicitUser();
  const consumedAt = input.consumedAt ?? new Date();

  const id = await insert({
    userId: user.id,
    foodName: input.foodName,
    heifaCategory: input.heifaCategory,
    servingQty: input.servingQty,
    servingUnit: normaliseServingUnit(input.servingUnit),
    calories: input.calories,
    proteinG: input.proteinG,
    carbsG: input.carbsG,
    fatG: input.fatG,
    sugarG: input.sugarG,
    source: input.source,
    fruityviceId: input.fruityviceId,
    consumedAt,
    // Derived from local components, never from UTC. See lib/domain/date.ts.
    consumedOn: toLocalDateString(consumedAt),
  });

  return {
    id,
    userId: user.id,
    foodName: input.foodName,
    heifaCategory: input.heifaCategory,
    servingQty: input.servingQty,
    servingUnit: normaliseServingUnit(input.servingUnit),
    calories: input.calories,
    proteinG: input.proteinG,
    carbsG: input.carbsG,
    fatG: input.fatG,
    sugarG: input.sugarG,
    source: input.source,
    fruityviceId: input.fruityviceId,
    consumedAt,
    consumedOn: toLocalDateString(consumedAt),
  };
}

export async function listRecentRecords(limit = 100): Promise<NutritionRecord[]> {
  const user = await getImplicitUser();

  return listByUser(user.id, limit);
}

/** Totals across a set of records, for the list header and dashboard. */
export interface MacroTotals {
  readonly calories: number;
  readonly proteinG: number;
  readonly carbsG: number;
  readonly fatG: number;
  readonly sugarG: number;
}

export function sumMacros(records: readonly NutritionRecord[]): MacroTotals {
  return records.reduce<MacroTotals>(
    (totals, record) => ({
      calories: totals.calories + record.calories,
      proteinG: totals.proteinG + record.proteinG,
      carbsG: totals.carbsG + record.carbsG,
      fatG: totals.fatG + record.fatG,
      sugarG: totals.sugarG + record.sugarG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, sugarG: 0 },
  );
}
