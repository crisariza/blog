import "@/styles/globals.css";
import { Gloria_Hallelujah } from "next/font/google";
import localFont from "next/font/local";
import { Metadata } from "next";
import { ReactNode } from "react";
import TopBar from "@/components/top-bar";
import Footer from "@/components/footer";
import StructuredData from "@/components/structured-data";
import SidePosters from "@/components/side-posters";
import SideStickers from "@/components/side-stickers";

const handFont = Gloria_Hallelujah({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

// Allo by Josh Puckett (SIL Open Font License), variable in weight, roundness and optical size
const alloFont = localFont({
  src: "./fonts/allo-variable.woff2",
  variable: "--font-allo",
  weight: "100 900",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://crisariza.com"
  ),
  title: "Cristian Ariza - Product Engineer",
  description:
    "Cristian Ariza - Senior product engineer building full-stack products, mobile apps and production AI agents.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Cristian Ariza - Product Engineer",
    description:
      "Cristian Ariza - Senior product engineer building full-stack products, mobile apps and production AI agents.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? undefined,
    siteName: "Cristian Ariza",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cristian Ariza - Product Engineer",
    description:
      "Cristian Ariza - Senior product engineer building full-stack products, mobile apps and production AI agents.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://crisariza.com";

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Cristian Ariza - Product Engineer",
    url: siteUrl,
    description:
      "Personal blog and portfolio of Cristian Ariza, Software Engineer",
    author: {
      "@type": "Person",
      name: "Cristian Ariza",
    },
    inLanguage: "en-US",
  };

  return (
    <html lang="en" className={`${handFont.variable} ${alloFont.variable}`}>
      <body>
        <StructuredData />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />
        <div className="relative flex flex-col min-h-screen">
          <SideStickers />
          <SidePosters />
          <main className="flex-grow flex flex-col">
            <div className="max-w-3xl w-full px-6 mt-8 mb-8 sm:my-10 mx-auto flex flex-col flex-grow">
              <TopBar />
              <div className="flex-grow my-12 sm:my-24">{children}</div>
              <Footer />
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
