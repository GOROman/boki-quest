import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://goroman.github.io/boki-quest/"),
  title: "BOKI QUEST｜日商簿記3級クイズゲーム",
  description: "大学生活のすきま時間に、簿記ちゃんと仕訳を楽しく学べる日商簿記3級クイズゲーム。",
  openGraph: {
    title: "BOKI QUEST｜講義のすきまに、簿記力をちょっとずつ。",
    description: "簿記ちゃんと楽しく学べる、日商簿記3級クイズゲーム。",
    images: ["https://goroman.github.io/boki-quest/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "BOKI QUEST",
    description: "講義のすきまに、簿記力をちょっとずつ。",
    images: ["https://goroman.github.io/boki-quest/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
