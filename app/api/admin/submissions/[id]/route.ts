import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { hasAdminAccess } from "@/lib/admin";
import {
  createPhoto,
  createStory,
  deletePhotosBySubmissionId,
  deleteStoriesBySubmissionId,
  deleteSubmission,
  getSubmissionById,
  updateSubmissionStatus
} from "@/lib/data-store";
import { removeMediaFiles } from "@/lib/media-store";

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
    if (updated.files && updated.files.length > 0) {
      for (const file of updated.files) {
        if (file.kind === "image") {
          await createPhoto({
            sourceSubmissionId: updated.id,
            imageUrl: file.url,
            caption: updated.message.length < 50 ? updated.message : null,
            name: updated.name,
            approved: true,
            featured: false
          });
        }
      }
    }

    if (updated.message && updated.message.length >= 50) {
      const coverImage = updated.files?.find((f) => f.kind === "image")?.url || null;
      await createStory({
        sourceSubmissionId: updated.id,
        title: null,
        body: updated.message,
        coverImage,
        authorName: updated.name,
        approved: true,
        featured: false
      });
    }
  }

  if (body.status === "rejected" && submission.status === "approved") {
    await deletePhotosBySubmissionId(submission.id);
    await deleteStoriesBySubmissionId(submission.id);
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

  await deletePhotosBySubmissionId(id);
  await deleteStoriesBySubmissionId(id);
  await removeMediaFiles(submission.files);
  await deleteSubmission(id);

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/stories");
  revalidatePath("/admin");

  return NextResponse.json({ success: true });
}
