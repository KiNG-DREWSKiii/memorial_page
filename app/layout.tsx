import type { Metadata } from "next";

import "@/app/globals.css";
import { memorialConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: memorialConfig.name,
  description: memorialConfig.message,
};

import { Navigation } from "@/components/navigation";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
