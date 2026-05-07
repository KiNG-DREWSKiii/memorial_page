import { listSubmissions } from "@/lib/data-store";
import type { Submission } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  let submissions: Submission[] = [];

  try {
    submissions = await listSubmissions("approved");
  } catch (error) {
    console.error("Failed to load gallery submissions.", error);
  }
  const mediaItems = submissions.flatMap((submission) =>
    submission.files.map((file, index) => ({
      id: `${submission.id}-${index}`,
      kind: file.kind,
      url: file.url,
      thumbnailUrl: file.thumbnailUrl,
      caption: file.caption || null,
      storyText: submission.message || null,
      name: submission.name
    }))
  );

  return (
    <main className="page-shell public-layout">
      <div className="container">
        <div className="section-heading text-center">
          <h1>Gallery</h1>
          <p className="hero-message">Photographs and videos lovingly added to the memorial.</p>
        </div>

        {mediaItems.length === 0 ? (
          <p className="text-center empty-state">No photographs or videos have been added yet.</p>
        ) : (
          <div className="masonry-grid">
            {mediaItems.map((item) => (
              <div key={item.id} className="masonry-item">
                <div className="gallery-item-kind">
                  {item.storyText ? "Story with media" : item.kind === "video" ? "Video memory" : "Photo memory"}
                </div>
                {item.kind === "video" ? (
                  <video
                    className="gallery-video"
                    src={item.url}
                    poster={item.thumbnailUrl || undefined}
                    controls
                    preload="metadata"
                  />
                ) : (
                  <img src={item.url} alt={item.caption || "Memorial Photo"} />
                )}
                {(item.caption || item.name || item.storyText) && (
                  <div className="photo-meta">
                    {item.caption && <p>{item.caption}</p>}
                    {!item.caption && item.storyText ? <p>{item.storyText}</p> : null}
                    {item.name && <span>Shared by {item.name}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
