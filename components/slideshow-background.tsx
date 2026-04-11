import type { SlideshowItem } from "@/lib/types";

export function SlideshowBackground({ items }: { items: SlideshowItem[] }) {
  const carouselItems = items.slice(0, 8);

  return (
    <section className="memory-carousel-section" aria-label="Memories in motion">
      <div className="memory-carousel-shell">
        <div className="memory-carousel-gradient" />
        {carouselItems.length > 0 ? (
          <div className="memory-carousel-slides">
            {carouselItems.map((item, index) =>
            item.kind === "message" ? (
              <div
                key={`${item.id}-${index}`}
                className="memory-carousel-slide memory-message-slide"
                style={{ animationDelay: `${index * 9}s` }}
              >
                <div className="memory-message-card">
                  <p className="memory-message-text">“{item.message}”</p>
                  {item.byline ? <span className="memory-message-byline">{item.byline}</span> : null}
                </div>
              </div>
            ) : (
              <img
                key={`${item.id}-${index}`}
                className="memory-carousel-slide"
                src={item.imageUrl || ""}
                alt={item.alt || ""}
                style={{ animationDelay: `${index * 9}s` }}
              />
            )
          )}
          </div>
        ) : (
          <div className="memory-carousel-fallback" />
        )}
        <div className="memory-carousel-vignette" />
      </div>
    </section>
  );
}
