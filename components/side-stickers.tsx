"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/** Link for the "my shelf" label under the book; hidden until there is one */
const SHELF_URL: string | null = null;

/** Positions are viewport percentages so the stickers stay put while scrolling */
const STICKERS = [
  {
    src: "/stickers/brain.webp",
    width: 520,
    height: 502,
    top: "14%",
    left: "18%",
    size: "7.7rem",
    rotate: -8,
    float: { y: -9, rotate: 1.8, duration: 5.4, delay: 0 },
  },
  {
    src: "/stickers/book.webp",
    width: 520,
    height: 520,
    top: "37%",
    left: "42%",
    size: "8.4rem",
    rotate: 6,
    float: { y: -8, rotate: 1.4, duration: 6.1, delay: 0.4 },
  },
  {
    src: "/stickers/king.webp",
    width: 300,
    height: 520,
    top: "60%",
    left: "24%",
    size: "5.6rem",
    rotate: -4,
    float: { y: -11, rotate: -2.4, duration: 6.6, delay: 0.8 },
  },
];

/** Halftone paper stickers fixed in the empty left margin, only on wide screens */
export default function SideStickers() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-y-0 left-0 z-30 hidden w-[calc((100vw-48rem)/2)] min-[1400px]:block"
    >
      {STICKERS.map((sticker, index) => (
        <motion.div
          key={sticker.src}
          className="pointer-events-auto absolute"
          style={{ top: sticker.top, left: sticker.left, width: sticker.size }}
          initial={{ opacity: 0, y: 12, rotate: sticker.rotate }}
          animate={{ opacity: 1, y: 0, rotate: sticker.rotate }}
          whileHover={{ rotate: 0, scale: 1.08 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 18,
            delay: 0.2 + index * 0.1,
          }}
        >
          <motion.div
            animate={{
              y: [0, sticker.float.y, 0],
              rotate: [0, sticker.float.rotate, 0],
            }}
            transition={{
              duration: sticker.float.duration,
              delay: sticker.float.delay,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <Image
              src={sticker.src}
              alt=""
              width={sticker.width}
              height={sticker.height}
              className="h-auto w-full drop-shadow-[0_10px_16px_rgba(0,0,0,0.45)]"
              unoptimized
            />
          </motion.div>
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
