import { Geist } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import ThemeProvider from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});



export const metadata = {
  title: "Ajay tailor | Custom Tailoring Platform",
  description: "Order custom-stitched clothes online while working with local tailoring shops. Premium fabrics, expert craftsmanship, perfect fit — every time.",
  keywords: ["custom tailoring", "online tailor", "custom clothes", "stitching", "tailoring platform", "measurements"],
  authors: [{ name: "Ajay tailor" }],
  icons: {
    icon: "/images/logo.jpeg",
  },
  openGraph: {
    title: "Ajay tailor | Custom Tailoring Platform",
    description: "Order custom-stitched clothes online while working with local tailoring shops.",
    type: "website",                        
    siteName: "Ajay tailor",
    images: [
      {
        url: "/images/logo.jpeg",
        width: 800,
        height: 800,
        alt: "Ajay tailor - Ajay tailor Channel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajay tailor | Custom Tailoring Platform",
    description: "Order custom-stitched clothes online while working with local tailoring shops.",
    images: ["/images/logo.jpeg"],
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
    <html lang="en" className={geistSans.variable} data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/images/logo.jpeg" />
      </head>
      <body>
        <SessionProviderWrapper>
          <ThemeProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
