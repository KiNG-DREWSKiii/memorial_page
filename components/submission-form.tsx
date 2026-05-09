"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { uploadLimits } from "@/lib/config";
import { validateMediaSelection } from "@/lib/media-rules";

async function normalizeUploadFiles(files: File[]) {
  const normalized = await Promise.all(
    files.map(async (file) => {
      const lowerType = file.type.toLowerCase();
      const lowerName = file.name.toLowerCase();
      const isHeic =
        lowerType === "image/heic" ||
        lowerType === "image/heif" ||
        lowerName.endsWith(".heic") ||
        lowerName.endsWith(".heif");

      if (!isHeic) {
        return file;
      }

      const heic2any = (await import("heic2any")).default;
      const converted = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.9
      });
      const outputBlob = Array.isArray(converted) ? converted[0] : converted;

      if (!(outputBlob instanceof Blob)) {
        throw new Error(`${file.name} could not be converted. Please try another image.`);
      }

      const nextName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
      return new File([outputBlob], nextName, {
        type: "image/jpeg",
        lastModified: file.lastModified
      });
    })
  );

  return normalized;
}

export function SubmissionForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [selectionMessage, setSelectionMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [mediaCaptions, setMediaCaptions] = useState<string[]>([]);
  const [isPreparingFiles, setIsPreparingFiles] = useState(false);

  async function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      setSelectedFiles([]);
      setMediaCaptions([]);
      setSelectionMessage("");
      return;
    }

    setIsPreparingFiles(true);
    setError("");
    setSelectionMessage("Preparing selected files...");

    try {
      const normalizedFiles = await normalizeUploadFiles(files);
      const validationError = validateMediaSelection(normalizedFiles);
      if (validationError) {
        setError(validationError);
        setSelectedFiles([]);
        setMediaCaptions([]);
        setSelectionMessage("");
        event.target.value = "";
        return;
      }

      setSelectedFiles(normalizedFiles);
      setMediaCaptions(normalizedFiles.map((_, index) => mediaCaptions[index] || ""));
      const imageCount = normalizedFiles.filter((file) => file.type.startsWith("image/")).length;
      const videoCount = normalizedFiles.filter((file) => file.type.startsWith("video/")).length;
      const parts = [];

      if (imageCount > 0) {
        parts.push(`${imageCount} photo${imageCount === 1 ? "" : "s"}`);
      }

      if (videoCount > 0) {
        parts.push(`${videoCount} video`);
      }

      const convertedCount = normalizedFiles.filter((file, index) => file !== files[index]).length;
      const conversionNote = convertedCount > 0 ? ` ${convertedCount} image${convertedCount === 1 ? "" : "s"} converted for upload.` : "";
      setSelectionMessage(
        `${parts.join(" and ")} selected. Limit ${uploadLimits.maxImageFiles} photos and ${uploadLimits.maxVideoFiles} video per submission.${conversionNote}`
      );
    } catch {
      setError("One of the selected photos could not be prepared. Please try JPG or PNG.");
      setSelectedFiles([]);
      setMediaCaptions([]);
      setSelectionMessage("");
      event.target.value = "";
    } finally {
      setIsPreparingFiles(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = formRef.current;
    if (!formElement) {
      return;
    }

    const formData = new FormData(formElement);
    setIsSubmitting(true);
    setError("");
    setResultMessage("");
    formData.set("mediaCaptions", JSON.stringify(mediaCaptions));
    formData.delete("media");
    for (const file of selectedFiles) {
      formData.append("media", file);
    }

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload.error || "Unable to send your memory.");
        return;
      }

      const payload = (await response.json()) as { message?: string };
      setResultMessage(payload.message || "Your memory has been received.");
      setSubmitted(true);
      formRef.current?.reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFiles([]);
      setMediaCaptions([]);
      setSelectionMessage("");
      router.refresh();
    } catch {
      setError("Unable to send your memory. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCaptionChange(index: number, value: string) {
    setMediaCaptions((current) => current.map((caption, currentIndex) => (currentIndex === index ? value : caption)));
  }

  if (submitted) {
    return (
      <div className="panel form-panel text-center">
        <h2>Thank you.</h2>
        <p className="hero-message">{resultMessage || "Your memory has been received and will be reviewed before it appears."}</p>
        <button className="secondary-button" onClick={() => setSubmitted(false)} style={{ marginTop: 24 }}>
          Share another memory
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="panel form-panel"
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <div className="section-heading">
        <p className="eyebrow">Share a Memory</p>
        <h2>Share a message, photo, or short video.</h2>
      </div>

      <label className="field">
        <span>Name</span>
        <input name="name" type="text" maxLength={80} placeholder="Optional" />
      </label>

      <label className="field">
        <span>Story or memory</span>
        <textarea
          name="message"
          maxLength={3000}
          rows={6}
          placeholder="Optional. Add this if you want the submission to appear in Stories."
        />
      </label>

      <label className="field">
        <span>Photos or video</span>
        <input
          ref={fileInputRef}
          name="media"
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFilesChange}
        />
      </label>

      <p className="microcopy">
        Up to {uploadLimits.maxImageFiles} photos and {uploadLimits.maxVideoFiles} short video per submission.
      </p>
      <p className="microcopy">
        Photos up to 12 MB each. Video up to 35 MB.
      </p>
      {selectedFiles.length > 0 ? (
        <div className="media-caption-list">
          {selectedFiles.map((file, index) => (
            <label key={`${file.name}-${index}`} className="field media-caption-field">
              <span>{file.type.startsWith("video/") ? "Video" : "Photo"} caption: {file.name}</span>
              <input
                type="text"
                maxLength={180}
                placeholder="Optional caption for the gallery"
                value={mediaCaptions[index] || ""}
                onChange={(event) => handleCaptionChange(index, event.target.value)}
              />
            </label>
          ))}
        </div>
      ) : null}
      {selectionMessage ? <p className="microcopy">{selectionMessage}</p> : null}

      <div className="form-footer">
        <button className="primary-button" type="submit" disabled={isSubmitting || isPreparingFiles}>
          {isPreparingFiles ? "Preparing..." : isSubmitting ? "Sending..." : "Submit"}
        </button>
      </div>

      {error ? <p className="submission-message is-error">{error}</p> : null}
    </form>
  );
}
