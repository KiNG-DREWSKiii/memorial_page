import { uploadLimits } from "@/lib/config";

const supportedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif"
]);

const heicImageTypes = new Set(["image/heic", "image/heif"]);

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

  const heicImage = imageFiles.find((file) => heicImageTypes.has(file.type.toLowerCase()));
  if (heicImage) {
    return `${heicImage.name} uses HEIC/HEIF, which is not supported yet. Please convert it to JPG or PNG first.`;
  }

  const unsupportedImage = imageFiles.find((file) => file.type && !supportedImageTypes.has(file.type.toLowerCase()));
  if (unsupportedImage) {
    return `${unsupportedImage.name} is not a supported image format. Please upload JPG, PNG, WebP, GIF, or AVIF.`;
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
