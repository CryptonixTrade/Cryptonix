import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import LogoutButton from "./components/LogoutButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cryptonix | AI Crypto Signals",
  description:
    "AI-powered crypto trading signals with LONG, SHORT, SL and TP analysis.",

  metadataBase: new URL("https://cryptonix.life"),

  openGraph: {
    title: "Cryptonix | AI Crypto Signals",
    description:
      "AI-powered crypto trading signals with LONG, SHORT, SL and TP analysis.",
    url: "https://cryptonix.life",
    siteName: "Cryptonix",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cryptonix AI Crypto Signals",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Cryptonix | AI Crypto Signals",
    description:
      "AI-powered crypto trading signals with LONG, SHORT, SL and TP analysis.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
  lang="en"
  style={{ background: "#000" }}
  className={`${geistSans.variable} ${geistMono.variable}`}
>
      <body
        style={{
          
          display: "flex",
          flexDirection: "column",

          border: "1px solid rgba(255,215,0,0.3)",
          boxSizing: "border-box",

          overflowX: "hidden",
overflowY: "auto",
        }}
      >

<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-RX3T7KNN6X"
  strategy="afterInteractive"
/>

<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-RX3T7KNN6X');
  `}
</Script>


        <Providers>
          {children}
          
          <LogoutButton />
        </Providers>
      </body>
    </html>
  );
}
