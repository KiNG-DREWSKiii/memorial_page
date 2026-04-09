import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";

import "@/app/globals.css";
import { memorialConfig } from "@/lib/config";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: memorialConfig.name,
  description: memorialConfig.message,
};

import { Navigation } from "@/components/navigation";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${outfit.variable}`}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
