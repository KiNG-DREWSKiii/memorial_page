import Link from "next/link";
import { memorialConfig } from "@/lib/config";

export function Navigation() {
  return (
    <nav className="site-nav">
      <div className="nav-container">
        <Link href="/" className="nav-brand">
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
