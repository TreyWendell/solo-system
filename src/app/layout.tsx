import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SYSTEM — Self Improvement RPG",
    template: "%s | SYSTEM",
  },
  description:
    "Gamify your self-improvement journey with RPG-style progression, daily quests, and stat tracking inspired by Solo Leveling.",
  keywords: ["self improvement", "habit tracker", "RPG", "gamification", "productivity"],
};

export const viewport: Viewport = {
  themeColor: "#050810",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#050810] text-[#e2e8f0] hud-scanlines">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
