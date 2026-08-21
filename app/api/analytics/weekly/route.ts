import { NextResponse, type NextRequest } from "next/server";

import { SetupRequiredError } from "@/lib/domain/errors";
import { z } from "zod";

import { DAYS_IN_WEEK } from "@/lib/domain/analytics";
import { getWeeklyAnalytics } from "@/lib/services/analytics";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  days: z.coerce.number().int().positive().max(90).default(DAYS_IN_WEEK),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    days: request.nextUrl.searchParams.get("days") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", issues: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await getWeeklyAnalytics(parsed.data.days));
  } catch (error) {
    if (error instanceof SetupRequiredError) {
      return NextResponse.json(
        { error: error.message, remedy: error.remedy },
        { status: 503 },
      );
    }

    console.error("[api/analytics/weekly] failed:", error);

    return NextResponse.json(
      { error: "Could not load analytics" },
      { status: 500 },
    );
  }
}
