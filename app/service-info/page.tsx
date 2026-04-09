import { memorialConfig } from "@/lib/config";

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
              Our hearts are broken by the sudden and tragic loss of our sweet Jaylyn. She brought unending joy, laughter, and light into our family and the lives of everyone who knew her. While we struggle to understand this unimaginable loss, we find comfort in the outpouring of love and support from our community.
            </p>
            <p className="hero-message" style={{ margin: "16px auto 0", fontSize: "1.1rem" }}>
              We know Jaylyn loved fiercely and was loved by many. Thank you for your continued prayers during this incredibly difficult time.
            </p>
          </div>

          <div style={{ padding: 32, background: "rgba(255, 255, 255, 0.4)", borderRadius: 16 }}>
            <h3>Memorial Service</h3>
            <p style={{ marginTop: 16, color: "var(--muted)", fontStyle: "italic" }}>
              Service arrangements are currently To Be Announced. <br/>
              Please check back here, as we will update this page with details once they are finalized.
            </p>
          </div>
          
          <div style={{ marginTop: 32 }}>
            <p className="microcopy">In the meantime, we invite you to share your photos and stories of Jaylyn below so we can keep her memory alive together.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
