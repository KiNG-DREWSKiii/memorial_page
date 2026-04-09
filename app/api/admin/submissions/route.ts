import { NextResponse } from "next/server";

import { hasAdminAccess } from "@/lib/admin";
import { listSubmissions } from "@/lib/data-store";
import type { SubmissionStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") as SubmissionStatus | null;
  const validStatus =
    status === "pending" || status === "approved" || status === "flagged" || status === "rejected"
      ? status
      : undefined;

  const submissions = await listSubmissions(validStatus);

  return NextResponse.json({ submissions });
}
