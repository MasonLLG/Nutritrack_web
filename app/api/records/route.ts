import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  createNutritionRecord,
  createRecordSchema,
  listRecentRecords,
} from "@/lib/services/nutrition";
import type { NutritionRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

const listQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(500).default(100),
});

/** Wire format: Date is not JSON, so consumedAt is serialised as ISO 8601. */
interface NutritionRecordDto extends Omit<NutritionRecord, "consumedAt"> {
  consumedAt: string;
}

function toDto(record: NutritionRecord): NutritionRecordDto {
  return { ...record, consumedAt: record.consumedAt.toISOString() };
}

export async function GET(request: NextRequest) {
  const parsed = listQuerySchema.safeParse({
    limit: request.nextUrl.searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", issues: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const records = await listRecentRecords(parsed.data.limit);

    return NextResponse.json({ records: records.map(toDto) });
  } catch (error) {
    console.error("[api/records] GET failed:", error);

    return NextResponse.json(
      { error: "Could not load records" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const parsed = createRecordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid record", issues: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const record = await createNutritionRecord(parsed.data);

    return NextResponse.json({ record: toDto(record) }, { status: 201 });
  } catch (error) {
    console.error("[api/records] POST failed:", error);

    return NextResponse.json(
      { error: "Could not save record" },
      { status: 500 },
    );
  }
}
