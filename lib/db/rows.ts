/**
 * Driver row shapes and row -> domain mappers.
 *
 * This is the single place where mysql2's result shape is known. Repositories
 * map here; nothing above the repository layer sees a RowDataPacket.
 *
 * Two driver behaviours are configured in lib/db/pool.ts and relied on here:
 *   - `decimalNumbers: true`  -> DECIMAL arrives as number, not string.
 *   - `dateStrings: ["DATE"]` -> DATE arrives as 'YYYY-MM-DD', not a Date at
 *     local midnight, which would shift the day in non-UTC timezones.
 */
import type { RowDataPacket } from "mysql2";

import { HEIFA_CATEGORIES, type HeifaCategory } from "@/lib/domain/heifa";
import type {
  HeifaAssessment,
  NutritionRecord,
  NutritionRecordSource,
  Sex,
  User,
} from "@/lib/types";

export interface UserRow extends RowDataPacket {
  id: number;
  uid: string;
  username: string;
  sex: Sex;
  phone_number: string;
  persona: string | null;
  meal_time: string | null;
  sleep_time: string | null;
  wake_time: string | null;
  food_preferences: string | null;
}

export interface HeifaAssessmentRow extends RowDataPacket {
  user_id: number;
  total_score: number;
  discretionary_score: number;
  vegetables_score: number;
  fruit_score: number;
  grains_cereals_score: number;
  wholegrains_score: number;
  meat_alternatives_score: number;
  dairy_alternatives_score: number;
  water_score: number;
  unsaturated_fat_score: number;
  saturated_fat_score: number;
  sodium_score: number;
  sugar_score: number;
  alcohol_score: number;
  discretionary_serve_size: number | null;
  vegetables_serve_size: number | null;
  fruit_serve_size: number | null;
  grains_cereals_serve_size: number | null;
  wholegrains_serve_size: number | null;
  meat_alternatives_serve_size: number | null;
  dairy_alternatives_serve_size: number | null;
  sodium_mg: number | null;
  alcohol_standard_drinks: number | null;
  water_total_ml: number | null;
  sugar_grams: number | null;
  saturated_fat_grams: number | null;
}

export interface NutritionRecordRow extends RowDataPacket {
  id: number;
  user_id: number;
  food_name: string;
  heifa_category: HeifaCategory | null;
  serving_qty: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  sugar_g: number;
  source: NutritionRecordSource;
  fruityvice_id: number | null;
  consumed_at: Date;
  consumed_on: string;
}

/** HEIFA category -> its score column, mirroring db/migrations/001_init.sql. */
const SCORE_COLUMNS: Readonly<
  Record<HeifaCategory, keyof HeifaAssessmentRow>
> = {
  total: "total_score",
  discretionary: "discretionary_score",
  vegetables: "vegetables_score",
  fruit: "fruit_score",
  grainsAndCereals: "grains_cereals_score",
  wholegrains: "wholegrains_score",
  meatAndAlternatives: "meat_alternatives_score",
  dairyAndAlternatives: "dairy_alternatives_score",
  water: "water_score",
  unsaturatedFat: "unsaturated_fat_score",
  saturatedFat: "saturated_fat_score",
  sodium: "sodium_score",
  sugar: "sugar_score",
  alcohol: "alcohol_score",
};

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    uid: row.uid,
    username: row.username,
    sex: row.sex,
    phoneNumber: row.phone_number,
    persona: row.persona,
    mealTime: row.meal_time,
    sleepTime: row.sleep_time,
    wakeTime: row.wake_time,
    foodPreferences: row.food_preferences,
  };
}

export function toHeifaAssessment(row: HeifaAssessmentRow): HeifaAssessment {
  const scores = {} as Record<HeifaCategory, number>;

  for (const category of HEIFA_CATEGORIES) {
    scores[category] = Number(row[SCORE_COLUMNS[category]]);
  }

  return {
    userId: row.user_id,
    scores,
    context: {
      discretionaryServeSize: row.discretionary_serve_size,
      vegetablesServeSize: row.vegetables_serve_size,
      fruitServeSize: row.fruit_serve_size,
      grainsCerealsServeSize: row.grains_cereals_serve_size,
      wholegrainsServeSize: row.wholegrains_serve_size,
      meatAlternativesServeSize: row.meat_alternatives_serve_size,
      dairyAlternativesServeSize: row.dairy_alternatives_serve_size,
      sodiumMg: row.sodium_mg,
      alcoholStandardDrinks: row.alcohol_standard_drinks,
      waterTotalMl: row.water_total_ml,
      sugarGrams: row.sugar_grams,
      saturatedFatGrams: row.saturated_fat_grams,
    },
  };
}

export function toNutritionRecord(row: NutritionRecordRow): NutritionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    foodName: row.food_name,
    heifaCategory: row.heifa_category,
    servingQty: Number(row.serving_qty),
    servingUnit: row.serving_unit,
    calories: Number(row.calories),
    proteinG: Number(row.protein_g),
    carbsG: Number(row.carbs_g),
    fatG: Number(row.fat_g),
    sugarG: Number(row.sugar_g),
    source: row.source,
    fruityviceId: row.fruityvice_id,
    consumedAt: row.consumed_at,
    consumedOn: row.consumed_on,
  };
}
