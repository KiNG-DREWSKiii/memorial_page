import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { createSubmission } from "@/lib/data-store";
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
  const status = moderation.decision === "REJECT" ? "rejected" : "pending"; // always pending until admin approval

  if (status === "rejected") {
    await removeMediaFiles(media);
    return NextResponse.json({ error: "Memory did not pass moderation guidelines." }, { status: 400 });
  }

  await createSubmission({
    name,
    message,
    files: media,
    aiConfidence: moderation.confidence,
    aiReason: moderation.reason
  });

  revalidatePath("/admin");

  return NextResponse.json({ success: true });
}
