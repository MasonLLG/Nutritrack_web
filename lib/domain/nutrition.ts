/**
 * Macro-nutrient arithmetic. Pure domain module: no I/O.
 */

export interface Macros {
  readonly calories: number;
  readonly proteinG: number;
  readonly carbsG: number;
  readonly fatG: number;
  readonly sugarG: number;
}

/** Two decimals is the precision the DECIMAL(8,2) columns store anyway. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Scale macros quoted per `basisAmount` to `amount`.
 *
 * External sources quote per a fixed basis — FruityVice uses 100 g — while
 * records store the macros of the actual serving.
 *
 * Guards against a zero basis (division by zero) and negative amounts, both of
 * which would otherwise produce NaN or negative nutrition values.
 */
export function scaleMacros(
  macros: Macros,
  amount: number,
  basisAmount: number,
): Macros {
  const factor =
    basisAmount > 0 && amount > 0 && Number.isFinite(amount)
      ? amount / basisAmount
      : 0;

  return {
    calories: round2(macros.calories * factor),
    proteinG: round2(macros.proteinG * factor),
    carbsG: round2(macros.carbsG * factor),
    fatG: round2(macros.fatG * factor),
    sugarG: round2(macros.sugarG * factor),
  };
}
