"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { Submission } from "@/lib/types";

type AdminState = {
  key: string;
  submissions: Submission[];
  status: "idle" | "loading" | "ready" | "error";
  error: string;
  filter: "pending" | "flagged" | "approved" | "rejected";
};

const initialState: AdminState = {
  key: "",
  submissions: [],
  status: "idle",
  error: "",
  filter: "pending"
};

export function AdminPanel() {
  const router = useRouter();
  const [state, setState] = useState<AdminState>(initialState);

  useEffect(() => {
    const savedKey = window.sessionStorage.getItem("memorial-admin-key");
    if (savedKey) {
      setState((current) => ({ ...current, key: savedKey }));
    }
  }, []);

  async function loadSubmissions(nextFilter: "pending" | "flagged" | "approved" | "rejected" = state.filter, nextKey = state.key) {
    setState((current) => ({ ...current, status: "loading", filter: nextFilter, error: "" }));

    const response = await fetch(`/api/admin/submissions?status=${nextFilter}`, {
      headers: {
        "x-admin-key": nextKey
      }
    });

    const payload = (await response.json()) as { submissions?: Submission[]; error?: string };

    if (!response.ok) {
      setState((current) => ({
        ...current,
        status: "error",
        submissions: [],
        error: payload.error ?? "Could not load admin data."
      }));
      return;
    }

    setState((current) => ({
      ...current,
      status: "ready",
      submissions: payload.submissions ?? [],
      filter: nextFilter,
      error: ""
    }));
  }

  async function handleAction(id: string, method: "PATCH" | "DELETE", status?: "approved" | "flagged" | "rejected") {
    const response = await fetch(`/api/admin/submissions/${id}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": state.key
      },
      body: method === "PATCH" ? JSON.stringify({ status }) : undefined
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setState((current) => ({ ...current, error: payload.error ?? "Admin action failed." }));
      return;
    }

    await loadSubmissions();
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <section className="admin-shell">
      <div className="panel admin-auth">
        <div className="section-heading">
          <p className="eyebrow">Admin</p>
          <h1>Review submissions to add to the memorial.</h1>
        </div>

        <label className="field">
          <span>Admin key</span>
          <input
            type="password"
            value={state.key}
            onChange={(event) => setState((current) => ({ ...current, key: event.target.value }))}
            placeholder="Set ADMIN_ACCESS_KEY in .env"
          />
        </label>

        <div className="admin-actions-row">
          <button
            className="primary-button"
            type="button"
            onClick={() => {
              window.sessionStorage.setItem("memorial-admin-key", state.key);
              void loadSubmissions("pending");
            }}
          >
            Load Pending
          </button>
          <button className="secondary-button" type="button" onClick={() => void loadSubmissions("approved")}>
            Approved
          </button>
          <button className="secondary-button" type="button" onClick={() => void loadSubmissions("rejected")}>
            Rejected
          </button>
        </div>

        <p className="microcopy">Current default admin key: `admin-password123`. Replace it before public launch.</p>
        {state.error ? <p className="submission-message is-error">{state.error}</p> : null}
      </div>

      <div className="timeline">
        {state.status === "loading" ? <div className="panel">Loading submissions...</div> : null}
        {state.status === "ready" && state.submissions.length === 0 ? (
          <div className="panel">No submissions in this queue.</div>
        ) : null}
        {state.submissions.map((sub) => (
          <article className="timeline-card admin-card" key={sub.id}>
            <div className="timeline-meta">
              <span>{sub.name || "Anonymous"}</span>
              <span>{sub.status}</span>
            </div>
            
            {sub.files && sub.files.length > 0 && (
              <div className="media-grid">
                {sub.files.map((file, i) => (
                   <img key={i} src={file.url} className="media-item" alt="Attached photo" />
                ))}
              </div>
            )}
            
            <p className="timeline-content" style={{ marginTop: 16 }}>{sub.message}</p>
            <p className="microcopy">
              AI: {sub.aiReason} ({Math.round((sub.aiConfidence ?? 0) * 100)}%)
            </p>
            
            <div className="admin-actions-row" style={{ marginTop: 24 }}>
              <button className="primary-button" type="button" onClick={() => void handleAction(sub.id, "PATCH", "approved")}>
                Approve (Publish)
              </button>
              <button className="secondary-button" type="button" onClick={() => void handleAction(sub.id, "PATCH", "rejected")}>
                Reject
              </button>
              <button className="secondary-button" type="button" onClick={() => void handleAction(sub.id, "DELETE")}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
