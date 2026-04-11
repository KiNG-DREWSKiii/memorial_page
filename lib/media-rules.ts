import { uploadLimits } from "@/lib/config";

type UploadCandidate = {
  type: string;
  size: number;
  name: string;
};

export function validateMediaSelection(files: UploadCandidate[]) {
  const imageFiles = files.filter((file) => file.type.startsWith("image/"));
  const videoFiles = files.filter((file) => file.type.startsWith("video/"));
  const unsupportedFiles = files.filter((file) => !file.type.startsWith("image/") && !file.type.startsWith("video/"));

  if (unsupportedFiles.length > 0) {
    return "Only images and videos are allowed.";
  }

  if (files.length > uploadLimits.maxMediaFiles) {
    return `Please upload no more than ${uploadLimits.maxMediaFiles} files per submission.`;
  }

  if (imageFiles.length > uploadLimits.maxImageFiles) {
    return `Please upload no more than ${uploadLimits.maxImageFiles} photos per submission.`;
  }

  if (videoFiles.length > uploadLimits.maxVideoFiles) {
    return "Please upload only one video per submission.";
  }

  const oversizedImage = imageFiles.find((file) => file.size > uploadLimits.maxImageBytes);
  if (oversizedImage) {
    return `${oversizedImage.name} is too large. Photos must be under 12 MB.`;
  }

  const oversizedVideo = videoFiles.find((file) => file.size > uploadLimits.maxVideoBytes);
  if (oversizedVideo) {
    return `${oversizedVideo.name} is too large. Videos must be under 35 MB.`;
  }

  return null;
}
