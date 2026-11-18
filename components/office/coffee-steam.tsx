"use client";

import { motion } from "framer-motion";
import { OFFICE_MUG, OFFICE_SCENE } from "@/lib/office-objects";

/** Three wisps that drift up from the mug every few seconds */
const WISPS = [
  { offset: -0.25, delay: 0, sway: 6 },
  { offset: 0, delay: 0.6, sway: -7 },
  { offset: 0.25, delay: 1.2, sway: 5 },
];
const WISP_DURATION = 3.2;
const PAUSE_BETWEEN_PUFFS = 4.5;

const toPercent = (value: number, total: number) => `${(value / total) * 100}%`;

export default function CoffeeSteam() {
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
      {WISPS.map((wisp) => (
        <motion.svg
          key={wisp.delay}
          viewBox="0 0 20 60"
          className="absolute bottom-0 h-full w-1/3"
          style={{ left: `${(0.5 + wisp.offset) * 100 - 16}%` }}
          initial={{ opacity: 0, y: "10%", scaleY: 0.6 }}
          animate={{
            opacity: [0, 0.85, 0.6, 0],
            y: ["10%", "-15%", "-40%", "-65%"],
            x: [0, wisp.sway, -wisp.sway / 2, wisp.sway],
            scaleY: [0.6, 1, 1.1, 1.2],
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
            d="M10 58 C 2 46, 18 38, 10 28 S 4 12, 11 2"
            fill="none"
            stroke="#f8f6f2"
            strokeWidth={4.5}
            strokeLinecap="round"
            className="blur-[1px] [filter:drop-shadow(0_0_1.5px_rgba(40,30,20,0.55))]"
          />
        </motion.svg>
      ))}
    </div>
  );
}
