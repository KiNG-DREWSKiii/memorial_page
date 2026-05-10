import { memorialConfig, serviceConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function ServiceInfoPage() {
  return (
    <main className="page-shell public-layout center-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="panel form-panel text-center">
          <div className="section-heading">
            <h1>Service Details</h1>
            <p className="eyebrow">{memorialConfig.name}</p>
          </div>

          <div style={{ marginTop: 32, marginBottom: 32, lineHeight: 1.8 }}>
            <p className="hero-message" style={{ margin: "0 auto", fontSize: "1.1rem" }}>
              {serviceConfig.summary}
            </p>
            <p className="hero-message" style={{ margin: "16px auto 0", fontSize: "1.1rem" }}>
              {serviceConfig.note}
            </p>
          </div>

          <div style={{ padding: 32, background: "rgba(255, 255, 255, 0.4)", borderRadius: 16, textAlign: "left" }}>
            <h3 style={{ marginTop: 0 }}>{serviceConfig.title}</h3>
            <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
              <p style={{ margin: 0 }}>
                <strong>Date:</strong> {serviceConfig.dateLabel}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Time:</strong> {serviceConfig.timeLabel}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Location:</strong> {serviceConfig.venue}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Address:</strong> {serviceConfig.address}
              </p>
              <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>
                {serviceConfig.arrangements}
              </p>
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <p className="microcopy">
              If you are unable to attend in person, we invite you to share photos and memories here so their tribute can continue to grow.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
