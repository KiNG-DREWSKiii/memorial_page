import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { memorialConfig } from "@/lib/config";
import { createSubmission, getSiteSettings } from "@/lib/data-store";
import { validateMediaSelection } from "@/lib/media-rules";
import { removeMediaFiles, saveMediaFiles } from "@/lib/media-store";
import { moderateMemorialPost } from "@/lib/moderation";
import { publishSubmissionArtifacts } from "@/lib/publishing";

export const dynamic = "force-dynamic";

const AUTO_APPROVE_CONFIDENCE = 0.9;
const MIN_REJECT_CONFIDENCE = 0.85;

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim() || null;
  const message = String(formData.get("message") || "").trim();
  const files = formData
    .getAll("media")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const mediaValidationError = validateMediaSelection(files);

  if (!message && files.length === 0) {
    return NextResponse.json({ error: "Please share a message or photo." }, { status: 400 });
  }

  if (mediaValidationError) {
    return NextResponse.json({ error: mediaValidationError }, { status: 400 });
  }

  const media = await saveMediaFiles(files);
  const moderation = await moderateMemorialPost(name, message, media);
  const settings = await getSiteSettings();
  const status =
    moderation.decision === "REJECT" && moderation.confidence >= MIN_REJECT_CONFIDENCE
      ? "rejected"
      : moderation.decision === "FLAG"
        ? "flagged"
        : moderation.decision === "APPROVE" &&
            moderation.confidence >= AUTO_APPROVE_CONFIDENCE &&
            settings.submissionMode === "open"
          ? "approved"
          : "pending";

  if (status === "rejected") {
    await removeMediaFiles(media);
    return NextResponse.json({ error: "Memory did not pass moderation guidelines." }, { status: 400 });
  }

  const submission = await createSubmission({
    memorialKey: memorialConfig.key,
    name,
    message,
    status,
    files: media,
    aiConfidence: moderation.confidence,
    aiReason: moderation.reason
  });

  if (status === "approved") {
    await publishSubmissionArtifacts(submission);
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
