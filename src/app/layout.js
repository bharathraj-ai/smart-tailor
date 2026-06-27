import { Geist } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});



export const metadata = {
  title: "SmartTailor | Custom Tailoring Platform",
  description: "Order custom-stitched clothes online while working with local tailoring shops. Premium fabrics, expert craftsmanship, perfect fit — every time.",
  keywords: ["custom tailoring", "online tailor", "custom clothes", "stitching", "tailoring platform", "measurements"],
  authors: [{ name: "SmartTailor" }],
  openGraph: {
    title: "SmartTailor | Custom Tailoring Platform",
    description: "Order custom-stitched clothes online while working with local tailoring shops.",
    type: "website",
    siteName: "SmartTailor",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartTailor | Custom Tailoring Platform",
    description: "Order custom-stitched clothes online while working with local tailoring shops.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#d97706",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body>
        <SessionProviderWrapper>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
