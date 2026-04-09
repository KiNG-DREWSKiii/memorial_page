import { listPhotos } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const photos = await listPhotos(true);

  return (
    <main className="page-shell public-layout">
      <div className="container">
        <div className="section-heading text-center">
          <h1>Gallery</h1>
          <p className="hero-message">Photographs lovingly added to the memorial.</p>
        </div>

        {photos.length === 0 ? (
          <p className="text-center empty-state">No photographs have been added yet.</p>
        ) : (
          <div className="masonry-grid">
            {photos.map((photo) => (
              <div key={photo.id} className="masonry-item">
                <img src={photo.imageUrl} alt={photo.caption || "Memorial Photo"} />
                {(photo.caption || photo.name) && (
                  <div className="photo-meta">
                    {photo.caption && <p>{photo.caption}</p>}
                    {photo.name && <span>Shared by {photo.name}</span>}
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
