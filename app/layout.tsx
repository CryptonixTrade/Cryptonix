import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import SessionGuard from "./SessionGuard"; // 👈 добавили
import LogoutButton from "./components/LogoutButton"; // 👈 ДОБАВИЛИ

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