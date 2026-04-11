"use client";

import { useEffect, useRef, useState } from "react";

import type { SlideshowItem } from "@/lib/types";

const SLIDE_DURATION_MS = 7000;

function shuffleItems(items: SlideshowItem[]) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function buildInitialQueue(items: SlideshowItem[]) {
  return shuffleItems(items);
}

export function SlideshowBackground({ items }: { items: SlideshowItem[] }) {
  const [queue, setQueue] = useState(() => buildInitialQueue(items));
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = queue[activeIndex] ?? null;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQueue(buildInitialQueue(items));
    setActiveIndex(0);
  }, [items]);

  useEffect(() => {
    if (queue.length <= 1) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setActiveIndex((currentIndex) => {
        const nextIndex = currentIndex + 1;

        if (nextIndex < queue.length) {
          return nextIndex;
        }

        setQueue((currentQueue) => shuffleItems(currentQueue));
        return 0;
      });
    }, SLIDE_DURATION_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeIndex, queue]);

  return (
    <section className="memory-carousel-section" aria-label="Memories in motion">
      <div className="memory-carousel-shell">
        <div className="memory-carousel-gradient" />
        {activeItem ? (
          <div className="memory-carousel-slides">
            {queue.map((item, index) =>
              item.kind === "message" ? (
                <div
                  key={`${item.id}-${index}`}
                  className={`memory-carousel-slide memory-message-slide${index === activeIndex ? " is-active" : ""}`}
                  aria-hidden={index !== activeIndex}
                >
                  <div className="memory-message-card">
                    <p className="memory-message-text">“{item.message}”</p>
                    {item.byline ? <span className="memory-message-byline">{item.byline}</span> : null}
                  </div>
                </div>
              ) : (
                <div
                  key={`${item.id}-${index}`}
                  className={`memory-carousel-slide memory-image-slide${index === activeIndex ? " is-active" : ""}`}
                  aria-hidden={index !== activeIndex}
                >
                  <img
                    className="memory-carousel-image"
                    src={item.imageUrl || ""}
                    alt={item.alt || ""}
                    loading={index <= 1 ? "eager" : "lazy"}
                    fetchPriority={index === activeIndex ? "high" : "auto"}
                  />
                </div>
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
