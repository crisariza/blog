import "@/styles/globals.css";
import { GeistMono } from "geist/font/mono";
import { Metadata } from "next";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
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
    url: process.env.NEXT_PUBLIC_SITE_URL,
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistMono.className}>
      <body className="bg-[#1c1c1c] text-neutral-300">{children}</body>
    </html>
  );
}
