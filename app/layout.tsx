import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { Metadata } from "next";
import { ReactNode } from "react";
import TopBar from "@/components/top-bar";
import Footer from "@/components/footer";
import StructuredData from "@/components/structured-data";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://crisariza.com"
  ),
  title: "Cristian Ariza - Software Engineer",
  description:
    "Cristian Ariza - Software Engineer with 4 years of hands-on experience in front-end and back-end development. Eager in startups that create awesome products.",
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
    title: "Cristian Ariza - Software Engineer",
    description:
      "Cristian Ariza - Software Engineer with 4 years of hands-on experience in front-end and back-end development. Eager in startups that create awesome products.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? undefined,
    siteName: "Cristian Ariza",
    images: [
      {
        url: "/images/default-og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cristian Ariza - Software Engineer",
    description:
      "Cristian Ariza - Software Engineer with 4 years of hands-on experience in front-end and back-end development. Eager in startups that create awesome products.",
    images: ["/images/default-og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://crisariza.com";

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Cristian Ariza - Software Engineer",
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
    <html lang="en" className={GeistSans.className}>
      <body className="bg-[#1c1c1c] text-neutral-300">
        <StructuredData type="home" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow flex flex-col">
            <div className="max-w-screen-sm w-full px-6 mt-8 mb-8 sm:my-8 mx-auto flex flex-col flex-grow">
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
