import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { createPhoto, createStory, createSubmission, getSiteSettings } from "@/lib/data-store";
import { removeMediaFiles, saveMediaFiles } from "@/lib/media-store";
import { moderateMemorialPost } from "@/lib/moderation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim() || null;
  const message = String(formData.get("message") || "").trim();
  const files = formData
    .getAll("media")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!message && files.length === 0) {
    return NextResponse.json({ error: "Please share a message or photo." }, { status: 400 });
  }

  const media = await saveMediaFiles(files);
  const moderation = await moderateMemorialPost(name, message, media);
  const settings = await getSiteSettings();
  const status =
    moderation.decision === "REJECT"
      ? "rejected"
      : settings.submissionMode === "open" && moderation.decision === "APPROVE"
        ? "approved"
        : moderation.decision === "FLAG"
          ? "flagged"
          : "pending";

  if (status === "rejected") {
    await removeMediaFiles(media);
    return NextResponse.json({ error: "Memory did not pass moderation guidelines." }, { status: 400 });
  }

  const submission = await createSubmission({
    name,
    message,
    status,
    files: media,
    aiConfidence: moderation.confidence,
    aiReason: moderation.reason
  });

  if (status === "approved") {
    for (const file of submission.files) {
      if (file.kind === "image") {
        await createPhoto({
          sourceSubmissionId: submission.id,
          imageUrl: file.url,
          caption: submission.message.length < 50 ? submission.message : null,
          name: submission.name,
          approved: true,
          featured: false
        });
      }
    }

    if (submission.message && submission.message.length >= 50) {
      const coverImage = submission.files.find((f) => f.kind === "image")?.url || null;
      await createStory({
        sourceSubmissionId: submission.id,
        title: null,
        body: submission.message,
        coverImage,
        authorName: submission.name,
        approved: true,
        featured: false
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/stories");
  revalidatePath("/admin");

  return NextResponse.json({
    success: true,
    status,
    message:
      status === "approved"
        ? "Your memory has been shared."
        : "Your memory has been received and is awaiting review."
  });
}
