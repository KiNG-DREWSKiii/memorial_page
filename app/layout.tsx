import type { Metadata } from "next";
import type { CSSProperties } from "react";

import "@/app/globals.css";
import { memorialConfig, memorialTheme } from "@/lib/config";

export const metadata: Metadata = {
  title: memorialConfig.name,
  description: memorialConfig.message,
};

import { Navigation } from "@/components/navigation";

const themeStyle = {
  "--bg": memorialTheme.bg,
  "--bg-soft": memorialTheme.bgSoft,
  "--panel": memorialTheme.panel,
  "--panel-strong": memorialTheme.panelStrong,
  "--line": memorialTheme.line,
  "--text": memorialTheme.text,
  "--muted": memorialTheme.muted,
  "--warm": memorialTheme.warm,
  "--primary": memorialTheme.primary,
  "--tint-strong": memorialTheme.tintStrong,
  "--tint-soft": memorialTheme.tintSoft,
  "--wash-strong": memorialTheme.washStrong,
  "--wash-soft": memorialTheme.washSoft,
  "--theme-background-image": `url("${memorialTheme.backgroundImage}")`
} as CSSProperties;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={themeStyle} data-theme={memorialTheme.preset}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
