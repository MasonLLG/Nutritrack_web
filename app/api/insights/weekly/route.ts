import { NextResponse } from "next/server";

import { SetupRequiredError } from "@/lib/domain/errors";

import { getWeeklyInsight } from "@/lib/services/insights";

export const dynamic = "force-dynamic";

/**
 * POST rather than GET: generating a summary may call a paid external API, so
 * it should not be triggered by a prefetch, crawler, or cache warm.
 */
export async function POST() {
  try {
    return NextResponse.json(await getWeeklyInsight());
  } catch (error) {
    if (error instanceof SetupRequiredError) {
      return NextResponse.json(
        { error: error.message, remedy: error.remedy },
        { status: 503 },
      );
    }

    console.error("[api/insights/weekly] failed:", error);

    return NextResponse.json(
      { error: "Could not generate a summary" },
      { status: 500 },
    );
  }
}
