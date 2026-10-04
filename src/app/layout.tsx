import type { Metadata } from "next";
import { Newsreader, Inter } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Blog Builder - Internal Editorial Platform",
  description: "An intentional editorial platform for company insights, engineering architecture, design craft, and cultural reflections.",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col font-sans bg-[#FAF8F5] text-[#343131] selection:bg-[#FFB22C]/30 selection:text-[#343131]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
