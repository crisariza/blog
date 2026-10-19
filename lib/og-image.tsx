import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const fontsDirectory = path.join(
  process.cwd(),
  "node_modules/geist/dist/fonts/geist-sans"
);

interface OgImageProps {
  title: string;
  subtitle: string;
}

// Rendered at build time; same background and font as the site
export const renderOgImage = async ({ title, subtitle }: OgImageProps) => {
  const [regular, semiBold, avatar] = await Promise.all([
    readFile(path.join(fontsDirectory, "Geist-Regular.ttf")),
    readFile(path.join(fontsDirectory, "Geist-SemiBold.ttf")),
    readFile(path.join(process.cwd(), "public/profile-pic.png")),
  ]);
  const avatarSrc = `data:image/png;base64,${avatar.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        backgroundColor: "#1c1c1c",
        color: "#d4d4d4",
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <img
          src={avatarSrc}
          width={88}
          height={88}
          alt=""
          style={{ borderRadius: 9999, border: "2px solid #404040" }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 34, fontWeight: 600, color: "#f5f5f5" }}>
            Cristian Ariza
          </span>
          <span style={{ fontSize: 26, color: "#a3a3a3" }}>crisariza.com</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <span
          style={{
            fontSize: title.length > 40 ? 64 : 76,
            fontWeight: 600,
            lineHeight: 1.1,
            color: "#f5f5f5",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </span>
        <span style={{ fontSize: 32, color: "#a3a3a3" }}>{subtitle}</span>
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: semiBold, weight: 600, style: "normal" },
      ],
    }
  );
};
