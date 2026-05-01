import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import SessionGuard from "./SessionGuard"; // 👈 добавили

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trading Terminal",
  description: "AI Trading Interface",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",

          border: "1px solid rgba(255,215,0,0.3)",
          boxSizing: "border-box",

          overflow: "hidden",
        }}
      >
        <Providers>
          <SessionGuard /> {/* 👈 вот тут магия */}
          {children}
        </Providers>
      </body>
    </html>
  );
}