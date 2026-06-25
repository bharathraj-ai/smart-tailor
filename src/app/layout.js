import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SmartTailor | Custom Tailoring Platform",
  description: "Order custom-stitched clothes online while working with local tailoring shops.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <SessionProviderWrapper>
          <Navbar />
          <main style={{ paddingTop: 'var(--nav-height)', minHeight: 'calc(100vh - var(--nav-height))' }}>
            {children}
          </main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
