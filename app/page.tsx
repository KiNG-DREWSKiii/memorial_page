import Link from "next/link";
import { SlideshowBackground } from "@/components/slideshow-background";
import { memorialConfig } from "@/lib/config";
import { listPhotos, listStories } from "@/lib/data-store";
import { shuffleArray } from "@/lib/utils";
import type { SlideshowItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const approvedPhotos = await listPhotos(true);
  const approvedStories = await listStories(true);

  const featuredPhotos = approvedPhotos.filter((p) => p.featured).slice(0, 4);
  const featuredSlides: SlideshowItem[] = featuredPhotos.map((photo) => ({
    id: `photo-${photo.id}`,
    kind: "image",
    imageUrl: photo.imageUrl,
    alt: photo.caption || "Memorial photo"
  }));
  const storyCoverSlides: SlideshowItem[] = approvedStories
    .filter((story) => Boolean(story.coverImage))
    .map((story) => ({
      id: `story-${story.id}`,
      kind: "image",
      imageUrl: story.coverImage as string,
      alt: story.title || "Memorial story cover"
    }));
  const photoSlides: SlideshowItem[] = approvedPhotos.map((photo) => ({
    id: `photo-${photo.id}`,
    kind: "image",
    imageUrl: photo.imageUrl,
    alt: photo.caption || "Memorial photo"
  }));
  const messageSlides: SlideshowItem[] = approvedStories
    .filter((story) => story.body.trim().length > 0)
    .map((story) => ({
      id: `message-${story.id}`,
      kind: "message",
      message: story.body.trim().length > 190 ? `${story.body.trim().slice(0, 190)}...` : story.body.trim(),
      byline: story.authorName || "Family/Friends"
    }));
  const seenUrls = new Set(featuredSlides.map((item) => item.imageUrl));
  const randomizedImagePool = shuffleArray([...storyCoverSlides, ...photoSlides]).filter((item) => {
    if (seenUrls.has(item.imageUrl)) {
      return false;
    }

    seenUrls.add(item.imageUrl);
    return true;
  });
  const randomizedMessagePool = shuffleArray(messageSlides);
  const alternatingPool: SlideshowItem[] = [];
  const maxSlides = 8;

  while (
    alternatingPool.length < maxSlides &&
    (randomizedImagePool.length > 0 || randomizedMessagePool.length > 0)
  ) {
    if (randomizedImagePool.length > 0) {
      alternatingPool.push(randomizedImagePool.shift() as SlideshowItem);
    }

    if (alternatingPool.length < maxSlides && randomizedMessagePool.length > 0) {
      alternatingPool.push(randomizedMessagePool.shift() as SlideshowItem);
    }
  }

  const slideshowItems = [...featuredSlides, ...alternatingPool].slice(0, maxSlides);

  return (
    <main className="page-shell public-layout">
      <section className="hero-section center-hero">
        <div className="hero-copy text-center">
          <p className="eyebrow">In Loving Memory</p>
          <h1>{memorialConfig.name}</h1>
          <div className="hero-portrait-frame" aria-hidden="true">
            {memorialConfig.portraitUrl ? (
              <img className="hero-portrait-image" src={memorialConfig.portraitUrl} alt={`${memorialConfig.name} portrait`} />
            ) : (
              <div className="hero-portrait-placeholder">
                <div className="hero-silhouette-head" />
                <div className="hero-silhouette-body" />
              </div>
            )}
          </div>
          <p className="dates">{memorialConfig.dates}</p>
          <p className="hero-message">{memorialConfig.message}</p>
          <div className="hero-actions center-actions">
            <Link href="/gallery" className="primary-button">View Gallery</Link>
            <Link href="/stories" className="secondary-button">Read Stories</Link>
            <Link href="/share" className="secondary-button">Share a Memory</Link>
          </div>
        </div>
      </section>

      {slideshowItems.length > 0 && <SlideshowBackground items={slideshowItems} />}

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
