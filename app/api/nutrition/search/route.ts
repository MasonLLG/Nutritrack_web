import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  findFruitByName,
  FruityViceError,
  FRUITYVICE_BASIS_GRAMS,
  type FruityViceErrorKind,
} from "@/lib/clients/fruityvice";
import { scaleMacros, type Macros } from "@/lib/domain/nutrition";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().trim().min(1, "A search term is required").max(100),
  /** Grams to scale the per-100g figures to. Defaults to the basis itself. */
  grams: z.coerce.number().positive().max(10_000).optional(),
});

/** Upstream failure -> HTTP status. Keeps status choice out of the client. */
const STATUS_BY_KIND: Record<FruityViceErrorKind, number> = {
  not_found: 404,
  unavailable: 503,
  invalid_response: 502,
};

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    q: request.nextUrl.searchParams.get("q") ?? "",
    grams: request.nextUrl.searchParams.get("grams") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", issues: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const fruit = await findFruitByName(parsed.data.q);
    const grams = parsed.data.grams ?? FRUITYVICE_BASIS_GRAMS;

    const per100g: Macros = {
      calories: fruit.nutritions.calories,
      proteinG: fruit.nutritions.protein,
      carbsG: fruit.nutritions.carbohydrates,
      fatG: fruit.nutritions.fat,
      sugarG: fruit.nutritions.sugar,
    };

    return NextResponse.json({
      fruit: {
        id: fruit.id,
        name: fruit.name,
        family: fruit.family,
        genus: fruit.genus,
        order: fruit.order,
      },
      basisGrams: FRUITYVICE_BASIS_GRAMS,
      grams,
      macros: scaleMacros(per100g, grams, FRUITYVICE_BASIS_GRAMS),
    });
  } catch (error) {
    if (error instanceof FruityViceError) {
      // Expected upstream conditions: log only the unexpected ones.
      if (error.kind !== "not_found") {
        console.error("[api/nutrition/search] upstream failure:", error);
      }

      return NextResponse.json(
        { error: error.message, kind: error.kind },
        { status: STATUS_BY_KIND[error.kind] },
      );
    }

    console.error("[api/nutrition/search] unexpected failure:", error);

    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
