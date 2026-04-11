import type { SlideshowItem } from "@/lib/types";

export function SlideshowBackground({ items }: { items: SlideshowItem[] }) {
  const backgroundMedia = items.slice(0, 8);

  return (
    <div className="background-shell" aria-hidden="true">
      <div className="background-gradient" />
      {backgroundMedia.length > 0 ? (
        <div className="background-slides">
          {backgroundMedia.map((item, index) =>
            item.kind === "message" ? (
              <div
                key={`${item.id}-${index}`}
                className="background-slide background-message-slide"
                style={{ animationDelay: `${index * 8}s` }}
              >
                <div className="background-message-card">
                  <p className="background-message-text">“{item.message}”</p>
                  {item.byline ? <span className="background-message-byline">{item.byline}</span> : null}
                </div>
              </div>
            ) : (
              <img
                key={`${item.id}-${index}`}
                className="background-slide"
                src={item.imageUrl || ""}
                alt={item.alt || ""}
                style={{ animationDelay: `${index * 8}s` }}
              />
            )
          )}
        </div>
      ) : (
        <div className="background-fallback" />
      )}
      <div className="background-vignette" />
    </div>
  );
}
