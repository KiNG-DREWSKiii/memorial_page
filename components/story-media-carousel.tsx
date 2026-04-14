"use client";

import { useEffect, useState } from "react";

import type { MediaAsset } from "@/lib/types";

export function StoryMediaCarousel({ media }: { media: MediaAsset[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [media]);

  if (media.length === 0) {
    return null;
  }

  const active = media[activeIndex];

  function showPrevious() {
    setActiveIndex((current) => (current === 0 ? media.length - 1 : current - 1));
  }

  function showNext() {
    setActiveIndex((current) => (current === media.length - 1 ? 0 : current + 1));
  }

  return (
    <div className="story-media-shell">
      <div className="story-media-frame">
        {active.kind === "video" ? (
          <video
            key={active.url}
            className="story-media-item"
            src={active.url}
            controls
            preload="metadata"
          />
        ) : (
          <img
            key={active.url}
            className="story-media-item"
            src={active.url}
            alt={active.caption || "Memorial memory"}
          />
        )}
      </div>

      {media.length > 1 ? (
        <div className="story-media-controls">
          <button type="button" className="secondary-button" onClick={showPrevious}>
            Previous
          </button>
          <span className="story-media-count">{activeIndex + 1} / {media.length}</span>
          <button type="button" className="secondary-button" onClick={showNext}>
            Next
          </button>
        </div>
      ) : null}

      {active.caption ? <p className="story-media-caption">{active.caption}</p> : null}
    </div>
  );
}
