"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { OFFICE_MUG, OFFICE_SCENE } from "@/lib/office-objects";

/** Faint, wavy wisps that drift up from the coffee now and then */
const WISPS = [
  {
    left: "30%",
    delay: 0,
    drift: 4,
    path: "M10 98 C 6 80, 14 66, 9 50 S 5 22, 11 4",
  },
  {
    left: "52%",
    delay: 1.1,
    drift: -5,
    path: "M10 98 C 15 82, 5 68, 11 52 S 15 26, 8 6",
  },
];
const WISP_DURATION = 4.8;
const PAUSE_BETWEEN_PUFFS = 3.5;

const toPercent = (value: number, total: number) => `${(value / total) * 100}%`;

export default function CoffeeSteam() {
  const filterId = useId();
  const { steamOrigin, steamWidth, steamHeight } = OFFICE_MUG;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        left: toPercent(steamOrigin.x - steamWidth / 2, OFFICE_SCENE.width),
        top: toPercent(steamOrigin.y - steamHeight, OFFICE_SCENE.height),
        width: toPercent(steamWidth, OFFICE_SCENE.width),
        height: toPercent(steamHeight, OFFICE_SCENE.height),
      }}
    >
      <svg className="absolute h-0 w-0">
        <filter id={filterId} x="-50%" y="-10%" width="200%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035 0.09"
            numOctaves={2}
            seed={7}
          />
          <feDisplacementMap in="SourceGraphic" scale={7} />
          <feGaussianBlur stdDeviation={1.6} />
        </filter>
      </svg>

      {WISPS.map((wisp) => (
        <motion.svg
          key={wisp.delay}
          viewBox="0 0 20 100"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-full w-[28%]"
          style={{ left: wisp.left }}
          initial={{ opacity: 0, y: "6%" }}
          animate={{
            opacity: [0, 0.32, 0.2, 0],
            y: ["6%", "-6%", "-18%", "-30%"],
            x: [0, wisp.drift, wisp.drift * 1.6, wisp.drift * 2.2],
            scaleX: [0.8, 1, 1.25, 1.5],
          }}
          transition={{
            duration: WISP_DURATION,
            delay: wisp.delay,
            repeat: Infinity,
            repeatDelay: PAUSE_BETWEEN_PUFFS,
            ease: "easeOut",
          }}
        >
          <path
            d={wisp.path}
            fill="none"
            stroke="#ffffff"
            strokeWidth={2.4}
            strokeLinecap="round"
            filter={`url(#${filterId})`}
          />
        </motion.svg>
      ))}
    </div>
  );
}
