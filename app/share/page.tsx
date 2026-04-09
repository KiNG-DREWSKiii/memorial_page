import { SubmissionForm } from "@/components/submission-form";

export const dynamic = "force-dynamic";

export default function SharePage() {
  return (
    <main className="page-shell public-layout center-page">
      <div className="share-container">
        <SubmissionForm />
      </div>
    </main>
  );
}
