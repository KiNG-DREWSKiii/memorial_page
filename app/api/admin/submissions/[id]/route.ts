import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { hasAdminAccess } from "@/lib/admin";
import {
  deleteSubmission,
  getSubmissionById,
  updateSubmissionStatus
} from "@/lib/data-store";
import { removeMediaFiles } from "@/lib/media-store";
import { publishSubmissionArtifacts, removePublishedSubmissionArtifacts } from "@/lib/publishing";

export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as { status?: "approved" | "flagged" | "rejected" };

  if (!body.status) {
    return NextResponse.json({ error: "Status is required." }, { status: 400 });
  }

  const submission = await getSubmissionById(id);
  if (!submission) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  const isFirstTimeApproval = body.status === "approved" && submission.status !== "approved";

  const updated = await updateSubmissionStatus(id, body.status, "Admin override.", 1);

  if (isFirstTimeApproval && updated) {
    await publishSubmissionArtifacts(updated);
  }

  if (body.status === "rejected" && submission.status === "approved") {
    await removePublishedSubmissionArtifacts(submission.id);
  }

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/stories");
  revalidatePath("/admin");

  return NextResponse.json({ submission: updated });
}

export async function DELETE(request: Request, context: Context) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const submission = await getSubmissionById(id);

  if (!submission) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  await removePublishedSubmissionArtifacts(id);
  await removeMediaFiles(submission.files);
  await deleteSubmission(id);

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/stories");
  revalidatePath("/admin");

  return NextResponse.json({ success: true });
}
