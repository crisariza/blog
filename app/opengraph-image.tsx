import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

export const alt = "Cristian Ariza - Software Engineer";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    title: "Software Engineer",
    subtitle: "Front-end and back-end. Building products at startups.",
  });
}
