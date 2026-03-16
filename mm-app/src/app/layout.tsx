import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "2026 March Madness Analytics",
  description:
    "Interactive 2026 NCAA Tournament bracket with KenPom analytics, matchup engine, upset probability, simulation, and bracket analysis.",
  openGraph: {
    title: "2026 March Madness Analytics",
    description: "Interactive bracket, matchup analytics, upset watch, and tournament simulation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="font-sans antialiased bg-base text-tx h-full overflow-hidden">
        {children}
      </body>
    </html>
  );
}
