import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { hasAdminAccess } from "@/lib/admin";
import { getSiteSettings, updateSiteSettings } from "@/lib/data-store";
import type { SubmissionMode } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { submissionMode?: SubmissionMode };

  if (body.submissionMode !== "open" && body.submissionMode !== "locked") {
    return NextResponse.json({ error: "A valid submissionMode is required." }, { status: 400 });
  }

  const settings = await updateSiteSettings(body.submissionMode);

  revalidatePath("/");
  revalidatePath("/share");
  revalidatePath("/admin");

  return NextResponse.json({ settings });
}
