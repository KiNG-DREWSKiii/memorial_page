import { createPhoto, createStory, deletePhotosBySubmissionId, deleteStoriesBySubmissionId } from "@/lib/data-store";
import type { Submission } from "@/lib/types";

export async function publishSubmissionArtifacts(submission: Submission) {
  for (const file of submission.files) {
    if (file.kind === "image") {
      await createPhoto({
        memorialKey: submission.memorialKey,
        sourceSubmissionId: submission.id,
        imageUrl: file.url,
        caption: submission.message.length < 50 ? submission.message : null,
        name: submission.name,
        approved: true,
        featured: false
      });
    }
  }

  if (submission.message.trim().length > 0) {
    const coverImage = submission.files.find((f) => f.kind === "image")?.url || null;
    await createStory({
      memorialKey: submission.memorialKey,
      sourceSubmissionId: submission.id,
      title: submission.message.trim().length <= 60 ? submission.message.trim() : null,
      body: submission.message,
      coverImage,
      authorName: submission.name,
      approved: true,
      featured: false
    });
  }
}

export async function removePublishedSubmissionArtifacts(submissionId: string) {
  await deletePhotosBySubmissionId(submissionId);
  await deleteStoriesBySubmissionId(submissionId);
}
