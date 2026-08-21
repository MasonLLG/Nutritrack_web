/**
 * HEIFA (Healthy Eating Index for Australian Adults) scoring rules.
 *
 * Pure domain module: no database, no HTTP, no environment access. It has two
 * consumers in different layers — the dashboard service and the build-time
 * import script — so it deliberately sits below both.
 *
 * The Android app stored each score twice, once per sex, and picked a column at
 * read time based on the subject's `Sex`. The web schema stores one resolved
 * score per category; this module is where that collapse happens.
 */

/**
 * The 13 scored components, excluding the aggregate `total`.
 *
 * These sum exactly to `total` — verified against all 9 rows of the source
 * data. Note that the Android app's Insights screen listed only 12 of them: it
 * omitted saturated fat, so its displayed scores never reconciled to the total.
 * That omission is not reproduced here.
 *
 * Declared as a literal tuple rather than derived by filtering, so it can be
 * handed straight to `z.enum()` and used as a union type.
 */
export const HEIFA_COMPONENT_CATEGORIES = [
  "discretionary",
  "vegetables",
  "fruit",
  "grainsAndCereals",
  "wholegrains",
  "meatAndAlternatives",
  "dairyAndAlternatives",
  "water",
  "unsaturatedFat",
  "saturatedFat",
  "sodium",
  "sugar",
  "alcohol",
] as const;

export type HeifaComponentCategory =
  (typeof HEIFA_COMPONENT_CATEGORIES)[number];

/** Every stored score column, including the aggregate. */
export const HEIFA_CATEGORIES = [
  "total",
  ...HEIFA_COMPONENT_CATEGORIES,
] as const;

export type HeifaCategory = (typeof HEIFA_CATEGORIES)[number];

/** Maximum attainable score per component. These sum to HEIFA_TOTAL_MAX. */
export const HEIFA_CATEGORY_MAX: Readonly<
  Record<HeifaComponentCategory, number>
> = {
  discretionary: 10,
  vegetables: 10,
  fruit: 10,
  grainsAndCereals: 5,
  wholegrains: 5,
  meatAndAlternatives: 10,
  dairyAndAlternatives: 10,
  water: 5,
  unsaturatedFat: 5,
  saturatedFat: 5,
  sodium: 10,
  sugar: 10,
  alcohol: 5,
};

export const HEIFA_TOTAL_MAX = 100;

export type Sex = "male" | "female";

export interface HeifaScorePair {
  readonly male: number;
  readonly female: number;
}

/** Human-readable labels for the dashboard. */
export const HEIFA_CATEGORY_LABELS: Readonly<Record<HeifaCategory, string>> = {
  total: "Total HEIFA score",
  discretionary: "Discretionary foods",
  vegetables: "Vegetables",
  fruit: "Fruit",
  grainsAndCereals: "Grains and cereals",
  wholegrains: "Wholegrains",
  meatAndAlternatives: "Meat and alternatives",
  dairyAndAlternatives: "Dairy and alternatives",
  water: "Water",
  unsaturatedFat: "Unsaturated fat",
  saturatedFat: "Saturated fat",
  sodium: "Sodium",
  sugar: "Sugar",
  alcohol: "Alcohol",
};

/**
 * Column names as they appear in the Android app's `assets/data.csv`, which are
 * also the Room `@ColumnInfo` names. Kept verbatim so the mapping to the source
 * data is auditable.
 */
export const HEIFA_CSV_COLUMNS: Readonly<
  Record<HeifaCategory, { readonly male: string; readonly female: string }>
> = {
  total: { male: "HEIFAtotalscoreMale", female: "HEIFAtotalscoreFemale" },
  discretionary: {
    male: "DiscretionaryHEIFAscoreMale",
    female: "DiscretionaryHEIFAscoreFemale",
  },
  vegetables: {
    male: "VegetablesHEIFAscoreMale",
    female: "VegetablesHEIFAscoreFemale",
  },
  fruit: { male: "FruitHEIFAscoreMale", female: "FruitHEIFAscoreFemale" },
  grainsAndCereals: {
    male: "GrainsandcerealsHEIFAscoreMale",
    female: "GrainsandcerealsHEIFAscoreFemale",
  },
  wholegrains: {
    male: "WholegrainsHEIFAscoreMale",
    female: "WholegrainsHEIFAscoreFemale",
  },
  meatAndAlternatives: {
    male: "MeatandalternativesHEIFAscoreMale",
    female: "MeatandalternativesHEIFAscoreFemale",
  },
  dairyAndAlternatives: {
    male: "DairyandalternativesHEIFAscoreMale",
    female: "DairyandalternativesHEIFAscoreFemale",
  },
  water: { male: "WaterHEIFAscoreMale", female: "WaterHEIFAscoreFemale" },
  unsaturatedFat: {
    male: "UnsaturatedFatHEIFAscoreMale",
    female: "UnsaturatedFatHEIFAscoreFemale",
  },
  saturatedFat: {
    male: "SaturatedFatHEIFAscoreMale",
    female: "SaturatedFatHEIFAscoreFemale",
  },
  sodium: { male: "SodiumHEIFAscoreMale", female: "SodiumHEIFAscoreFemale" },
  sugar: { male: "SugarHEIFAscoreMale", female: "SugarHEIFAscoreFemale" },
  alcohol: { male: "AlcoholHEIFAscoreMale", female: "AlcoholHEIFAscoreFemale" },
};

/**
 * Normalise the CSV's `Sex` value.
 *
 * Returns `null` for anything unrecognised. The Android app treated every
 * non-"Male" value as female, which would silently assign the wrong scores to a
 * malformed row; surfacing it as `null` lets the importer fail loudly instead.
 */
export function parseSex(raw: string): Sex | null {
  const normalised = raw.trim().toLowerCase();

  if (normalised === "male") return "male";
  if (normalised === "female") return "female";

  return null;
}

/** Collapse a set of male/female score pairs down to one score per category. */
export function resolveHeifaScores<K extends string>(
  pairs: Readonly<Record<K, HeifaScorePair>>,
  sex: Sex,
): Record<K, number> {
  const resolved = {} as Record<K, number>;

  for (const key of Object.keys(pairs) as K[]) {
    resolved[key] = pairs[key][sex];
  }

  return resolved;
}

function parseScore(raw: string | undefined, column: string): number {
  if (raw === undefined || raw.trim() === "") {
    throw new Error(`HEIFA column "${column}" is missing or empty`);
  }

  const value = Number(raw);

  if (!Number.isFinite(value)) {
    throw new Error(`HEIFA column "${column}" is not numeric: "${raw}"`);
  }

  return value;
}

/**
 * Resolve all 13 HEIFA scores for one CSV row.
 *
 * `sex` is passed in rather than read from the row so the caller decides how an
 * unparseable value is handled, and so the function stays trivially testable.
 */
export function resolveHeifaScoresFromCsvRow(
  row: Readonly<Record<string, string | undefined>>,
  sex: Sex,
): Record<HeifaCategory, number> {
  const scores = {} as Record<HeifaCategory, number>;

  for (const category of HEIFA_CATEGORIES) {
    const column = HEIFA_CSV_COLUMNS[category][sex];
    scores[category] = parseScore(row[column], column);
  }

  return scores;
}
