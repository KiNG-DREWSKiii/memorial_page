import type { SlideshowItem } from "@/lib/types";

export function SlideshowBackground({ items }: { items: SlideshowItem[] }) {
  const backgroundMedia = items.slice(0, 8);

  return (
    <div className="background-shell" aria-hidden="true">
      <div className="background-gradient" />
      {backgroundMedia.length > 0 ? (
        <div className="background-slides">
          {backgroundMedia.map((item, index) => (
            <img
              key={`${item.id}-${index}`}
              className="background-slide"
              src={item.imageUrl}
              alt={item.alt}
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
