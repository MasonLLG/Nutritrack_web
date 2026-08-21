import { NextResponse } from "next/server";

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
    console.error("[api/insights/weekly] failed:", error);

    return NextResponse.json(
      { error: "Could not generate a summary" },
      { status: 500 },
    );
  }
}
