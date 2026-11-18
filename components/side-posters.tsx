"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/** Positions are viewport percentages so the posters stay put while scrolling */
const POSTERS = [
  {
    src: "/posters/think-different.webp",
    alt: "Think Different poster with the Crazy Ones quote by Steve Jobs",
    width: 277,
    height: 378,
    top: "12%",
    right: "26%",
    size: "8.6rem",
    rotate: 4,
    tape: "left-1/2 -translate-x-1/2 -rotate-3",
  },
  {
    src: "/posters/lincoln.webp",
    alt: "Vintage Abraham Lincoln poster: Teach economy, it begins with saving money",
    width: 786,
    height: 1192,
    top: "50%",
    right: "34%",
    size: "8rem",
    rotate: -3,
    tape: "-left-3 top-1 -rotate-[38deg]",
  },
];

/** Taped posters fixed in the empty right margin, only on wide screens */
export default function SidePosters() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-y-0 right-0 z-30 hidden w-[calc((100vw-48rem)/2)] min-[1400px]:block"
    >
      {POSTERS.map((poster, index) => (
        <motion.div
          key={poster.src}
          className="pointer-events-auto absolute"
          style={{ top: poster.top, right: poster.right, width: poster.size }}
          initial={{ opacity: 0, y: 12, rotate: poster.rotate }}
          animate={{ opacity: 1, y: 0, rotate: poster.rotate }}
          whileHover={{ rotate: 0, scale: 1.06 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 18,
            delay: 0.3 + index * 0.1,
          }}
        >
          <div className="relative rounded-[3px] border border-white/10 bg-[#2a2a30] p-1.5 shadow-[0_14px_24px_-10px_rgba(0,0,0,0.7)]">
            <span
              className={`absolute -top-2.5 z-10 h-5 w-14 bg-[#a89a7c]/55 ${poster.tape}`}
            />
            <Image
              src={poster.src}
              alt={poster.alt}
              width={poster.width}
              height={poster.height}
              className="block h-auto w-full rounded-[2px]"
              unoptimized
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
