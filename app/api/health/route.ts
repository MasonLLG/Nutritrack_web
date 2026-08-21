import { NextResponse } from "next/server";

import { pingDatabase } from "@/lib/db/pool";

/**
 * ARCHITECTURAL EXCEPTION (the only one).
 *
 * Every other route handler must go route -> service -> repository and must not
 * touch the database layer directly. This one does, deliberately.
 *
 * It is not a business endpoint: it is a liveness probe for the infrastructure
 * itself. Routing it through a service would mean testing the service rather
 * than the connection, and there is no domain concept for "is the socket up".
 *
 * If a second exception is ever proposed, it needs the same written
 * justification here and in the architecture plan.
 */

// Never cached or statically prerendered: a liveness probe must reflect the
// state at request time.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await pingDatabase();

    return NextResponse.json({ status: "ok", database: "up" });
  } catch (error) {
    // Log the real cause server-side; return a generic message so connection
    // strings and credentials never reach the client.
    console.error("[health] database ping failed:", error);

    return NextResponse.json(
      { status: "error", database: "down" },
      { status: 503 },
    );
  }
}
