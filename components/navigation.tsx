import Link from "next/link";
import { memorialConfig } from "@/lib/config";

function MemorialEmblem({ kind }: { kind: "none" | "cross" | "dove" | "lily" | "rose" }) {
  if (kind === "none") {
    return null;
  }

  if (kind === "cross") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-emblem">
        <path d="M12 3v18M7 8h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "dove") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-emblem">
        <path
          d="M5 14c2.3-4.4 5.8-7 10.4-8 .4-.1.8.3.7.7-.2 1-.7 2-1.5 2.9 2.6-.2 4.6.7 5.4 2.9.1.3-.1.6-.4.7l-3 .8-2.2 3.2c-.2.2-.4.3-.7.2l-2.9-.8-3 2.1c-.4.3-1-.1-.9-.6l.3-3.1L5.4 15c-.4-.2-.6-.6-.4-1Z"
          fill="currentColor"
          opacity="0.9"
        />
      </svg>
    );
  }

  if (kind === "lily") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-emblem">
        <path
          d="M12 4c1.4 1.8 2.1 3.6 2 5.4 1.4-1 3-1.6 4.8-1.8-.2 2.5-1.2 4.6-3.1 6.1 1.2.2 2.4.7 3.5 1.5-1.6 1.3-3.4 1.9-5.5 1.9-.5 1.2-1 2.6-1.4 4-.1.4-.7.4-.8 0-.4-1.4-.9-2.8-1.4-4-2.1 0-3.9-.6-5.5-1.9 1.1-.8 2.3-1.3 3.5-1.5-1.9-1.5-2.9-3.6-3.1-6.1 1.8.2 3.4.8 4.8 1.8-.1-1.8.6-3.6 2-5.4Z"
          fill="currentColor"
          opacity="0.9"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-emblem">
      <path
        d="M12 6.2c1.3-2 4.5-2.6 6.2-.7 1.8 1.9 1.4 5.1-.6 6.8L12 17l-5.6-4.7c-2-1.7-2.4-4.9-.6-6.8 1.7-1.9 4.9-1.3 6.2.7Z"
        fill="currentColor"
        opacity="0.28"
      />
      <path
        d="M12 8.2c.8-1.1 2.5-1.5 3.7-.3 1.1 1.1.9 2.9-.4 3.9L12 14.5l-3.3-2.7c-1.3-1-1.5-2.8-.4-3.9 1.2-1.2 2.9-.8 3.7.3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 14.5v5.2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9.8 17.4c.6-.2 1.3-.2 2.2 0" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12 17.4c.9-.2 1.6-.2 2.2 0" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function Navigation() {
  return (
    <nav className="site-nav">
      <div className="nav-container">
        <Link href="/" className="nav-brand">
          <MemorialEmblem kind={memorialConfig.emblem} />
          {memorialConfig.name}
        </Link>
        <div className="nav-links">
          <Link href="/gallery">Gallery</Link>
          <Link href="/stories">Stories</Link>
          <Link href="/service-info">Service Info</Link>
          <Link href="/share" className="nav-cta">Share a Memory</Link>
        </div>
      </div>
    </nav>
  );
}
