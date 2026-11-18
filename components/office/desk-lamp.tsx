"use client";

import { motion } from "framer-motion";
import cn from "classnames";
import { OFFICE_LAMP, OFFICE_SCENE } from "@/lib/office-objects";
import { DeskLampProps } from "@/types";

const SWITCH_SIZE = { width: 58, height: 30 };
/** Quick flicker when the bulb comes back on */
const TURN_ON_FLICKER = [0, 0.9, 0.35, 1];

const toPercent = (value: number, total: number) => `${(value / total) * 100}%`;

export default function DeskLamp({ isOn, onToggle }: DeskLampProps) {
  const { glowCenter, glowRadius, switchPosition } = OFFICE_LAMP;

  return (
    <>
      {/* Warm light spilling from the shade */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute rounded-full mix-blend-screen"
        style={{
          left: toPercent(glowCenter.x - glowRadius, OFFICE_SCENE.width),
          top: toPercent(glowCenter.y - glowRadius, OFFICE_SCENE.height),
          width: toPercent(glowRadius * 2, OFFICE_SCENE.width),
          height: toPercent(glowRadius * 2, OFFICE_SCENE.height),
          background:
            "radial-gradient(circle, rgba(255,196,120,0.35) 0%, rgba(255,170,90,0.12) 40%, transparent 70%)",
        }}
        initial={false}
        animate={{ opacity: isOn ? TURN_ON_FLICKER : 0 }}
        transition={{
          duration: isOn ? 0.5 : 0.35,
          times: isOn ? [0, 0.3, 0.55, 1] : undefined,
        }}
      />

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={isOn}
        aria-label={isOn ? "Turn the lamp off" : "Turn the lamp on"}
        className="group absolute -translate-x-1/2 -translate-y-1/2 outline-none"
        style={{
          left: toPercent(switchPosition.x, OFFICE_SCENE.width),
          top: toPercent(switchPosition.y, OFFICE_SCENE.height),
          width: toPercent(SWITCH_SIZE.width, OFFICE_SCENE.width),
          height: toPercent(SWITCH_SIZE.height, OFFICE_SCENE.height),
        }}
      >
        <span
          className={cn(
            "relative block h-full w-full rounded-full border border-black/40 bg-neutral-800/85 shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-colors group-hover:bg-neutral-700 group-focus-visible:ring-2 group-focus-visible:ring-accent"
          )}
        >
          <motion.span
            className="absolute top-[12%] block h-[76%] aspect-square rounded-full"
            initial={false}
            animate={{
              left: isOn ? "52%" : "8%",
              backgroundColor: isOn ? "#ffd27a" : "#9ca3af",
              boxShadow: isOn
                ? "0 0 6px 1px rgba(255,200,110,0.9)"
                : "0 0 0 0 rgba(0,0,0,0)",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </span>
        <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-1.5 py-0.5 font-mono text-[10px] text-neutral-200 opacity-0 transition-opacity group-hover:opacity-100">
          {isOn ? "lights off" : "lights on"}
        </span>
      </button>
    </>
  );
}
