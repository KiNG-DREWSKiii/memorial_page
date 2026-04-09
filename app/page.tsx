import Link from "next/link";
import { SlideshowBackground } from "@/components/slideshow-background";
import { memorialConfig } from "@/lib/config";
import { listPhotos, listStories } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const approvedPhotos = await listPhotos(true);
  const approvedStories = await listStories(true);

  const featuredPhotos = approvedPhotos.filter((p) => p.featured).slice(0, 4);
  const recentStories = approvedStories.slice(0, 3);

  // If no featured photos, just use the latest 4 for the strip
  const stripPhotos = featuredPhotos.length > 0 ? featuredPhotos : approvedPhotos.slice(0, 4);

  return (
    <main className="page-shell public-layout">
      <SlideshowBackground photos={approvedPhotos} />

      <section className="hero-section center-hero">
        <div className="hero-copy text-center">
          <p className="eyebrow">In Loving Memory</p>
          <h1>{memorialConfig.name}</h1>
          <p className="dates">{memorialConfig.dates}</p>
          <p className="hero-message">{memorialConfig.message}</p>
          <div className="hero-actions center-actions">
            <Link href="/gallery" className="primary-button">View Gallery</Link>
            <Link href="/stories" className="secondary-button">Read Stories</Link>
            <Link href="/share" className="secondary-button">Share a Memory</Link>
          </div>
        </div>
      </section>

      {/* Featured Photo Strip */}
      {stripPhotos.length > 0 && (
        <section className="photo-strip">
          <div className="strip-container">
            {stripPhotos.map((photo) => (
              <div key={photo.id} className="strip-item">
                <img src={photo.imageUrl} alt={photo.caption || "Memorial Photo"} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Stories & Quote */}
      <section className="stories-preview-section">
        <div className="container">
          <div className="quote-block">
            <p className="quote-text">
              "Stories, photographs, and moments that continue to live on."
            </p>
          </div>
          
          {recentStories.length > 0 && (
            <div className="recent-stories-grid">
              {recentStories.map((story) => (
                <div key={story.id} className="story-card">
                  {story.coverImage && (
                    <img src={story.coverImage} className="story-card-image" alt="" />
                  )}
                  <div className="story-card-content">
                    <h3>{story.title}</h3>
                    <p className="story-meta">Shared by {story.authorName || "Family/Friends"}</p>
                    <p className="story-excerpt">{story.body.substring(0, 100)}...</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bottom-cta-section">
        <div className="panel soft-cta-panel">
          <h2>Your memories build this tribute.</h2>
          <p>Shared memories and photos are lovingly added to the memorial.</p>
          <Link href="/share" className="primary-button">Share a Memory</Link>
        </div>
      </section>
    </main>
  );
}
