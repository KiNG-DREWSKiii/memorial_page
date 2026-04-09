import type { Photo } from "@/lib/types";

export function SlideshowBackground({ photos }: { photos: Photo[] }) {
  const backgroundMedia = photos.slice(0, 8);

  return (
    <div className="background-shell" aria-hidden="true">
      <div className="background-gradient" />
      {backgroundMedia.length > 0 ? (
        <div className="background-slides">
          {backgroundMedia.map((photo, index) => (
            <img
              key={`${photo.id}-${index}`}
              className="background-slide"
              src={photo.imageUrl}
              alt={photo.caption || ""}
              style={{ animationDelay: `${index * 8}s` }}
            />
          ))}
        </div>
      ) : (
        <div className="background-fallback" />
      )}
      <div className="background-vignette" />
    </div>
  );
}

