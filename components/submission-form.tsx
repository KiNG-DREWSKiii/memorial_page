"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function SubmissionForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");
    setResultMessage("");

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
      router.refresh();
    } catch {
      setError("Unable to send your memory. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
      action={(formData) => {
        void handleSubmit(formData);
      }}
    >
      <div className="section-heading">
        <p className="eyebrow">Share a Memory</p>
        <h2>Leave words or photographs.</h2>
      </div>

      <label className="field">
        <span>Name</span>
        <input name="name" type="text" maxLength={80} placeholder="Optional" />
      </label>

      <label className="field">
        <span>Memory</span>
        <textarea
          name="message"
          required
          minLength={5}
          maxLength={3000}
          rows={6}
          placeholder="Share your thoughts or a memory..."
        />
      </label>

      <label className="field">
        <span>Photos</span>
        <input name="media" type="file" accept="image/*" multiple />
      </label>

      <div className="form-footer">
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Submit"}
        </button>
        <p className="microcopy">When submissions are open, safe memories can appear instantly. When locked, they go to admin review.</p>
      </div>

      {error ? <p className="submission-message is-error">{error}</p> : null}
    </form>
  );
}
