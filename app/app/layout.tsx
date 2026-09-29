import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { copy } from "@/lib/copy";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: copy.meta.title,
  description: copy.meta.description,
  openGraph: { title: copy.meta.ogTitle, description: copy.meta.ogDescription, type: "website" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b1b3a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
