"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/** Link for the "my shelf" label under the book; hidden until there is one */
const SHELF_URL: string | null = null;

const STICKERS = [
  {
    src: "/stickers/brain.webp",
    alt: "",
    width: 520,
    height: 502,
    top: "14rem",
    left: "12%",
    size: "11rem",
    rotate: -8,
  },
  {
    src: "/stickers/book.webp",
    alt: "",
    width: 520,
    height: 520,
    top: "44rem",
    left: "34%",
    size: "12rem",
    rotate: 6,
  },
  {
    src: "/stickers/king.webp",
    alt: "",
    width: 300,
    height: 520,
    top: "74rem",
    left: "16%",
    size: "8rem",
    rotate: -4,
  },
];

/** Halftone paper stickers in the empty left margin, only on wide screens */
export default function SideStickers() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 hidden w-[calc((100vw-48rem)/2)] min-[1400px]:block"
    >
      {STICKERS.map((sticker, index) => (
        <motion.div
          key={sticker.src}
          className="pointer-events-auto absolute"
          style={{ top: sticker.top, left: sticker.left, width: sticker.size }}
          initial={{ opacity: 0, y: 12, rotate: sticker.rotate }}
          animate={{ opacity: 1, y: 0, rotate: sticker.rotate }}
          whileHover={{ rotate: 0, scale: 1.06, y: -4 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 18,
            delay: 0.2 + index * 0.1,
          }}
        >
          <Image
            src={sticker.src}
            alt={sticker.alt}
            width={sticker.width}
            height={sticker.height}
            className="h-auto w-full drop-shadow-[0_10px_16px_rgba(0,0,0,0.45)]"
            unoptimized
          />
          {sticker.src.includes("book") && SHELF_URL && (
            <a
              href={SHELF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative mx-auto mt-3 flex w-fit -rotate-2 items-center gap-2 rounded-md border border-white/10 bg-surface-raised bg-dots px-4 py-1.5 font-hand text-sm text-neutral-100 shadow-elevated"
            >
              <span
                aria-hidden
                className="absolute -top-2 left-4 h-3 w-8 bg-amber-600/70"
              />
              <span className="text-amber-400">↗</span> my shelf
            </a>
          )}
        </motion.div>
      ))}
    </div>
  );
}
