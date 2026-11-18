"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import cn from "classnames";
import CoffeeSteam from "@/components/office/coffee-steam";
import DeskLamp from "@/components/office/desk-lamp";
import DeskMouse from "@/components/office/desk-mouse";
import { OFFICE_OBJECTS, OFFICE_SCENE } from "@/lib/office-objects";
import { OfficeObject, OfficeSceneProps } from "@/types";

const toPoints = (hotspot: OfficeObject["hotspot"]) =>
  hotspot.map(([x, y]) => `${x},${y}`).join(" ");

/** Top-right corner of the hotspot as a percentage of the scene, for the hover badge */
const badgePosition = (hotspot: OfficeObject["hotspot"]) => {
  const right = Math.max(...hotspot.map(([x]) => x));
  const top = Math.min(...hotspot.map(([, y]) => y));
  return {
    left: `${(right / OFFICE_SCENE.width) * 100}%`,
    top: `${(top / OFFICE_SCENE.height) * 100}%`,
  };
};

function BulbIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2a7 7 0 0 0-4 12.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26A7 7 0 0 0 12 2Zm-2 18a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1h-4Z" />
    </svg>
  );
}

export default function OfficeScene({ onSelect }: OfficeSceneProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [lampOn, setLampOn] = useState(true);

  const hovered = OFFICE_OBJECTS.find((object) => object.id === hoveredId);

  return (
    <div className="relative select-none overflow-hidden rounded-card">
      <Image
        src={OFFICE_SCENE.src}
        alt={OFFICE_SCENE.alt}
        width={OFFICE_SCENE.width}
        height={OFFICE_SCENE.height}
        className="block h-auto w-full"
        sizes="(min-width: 1024px) 1024px, 100vw"
        draggable={false}
        priority
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={false}
        animate={{ opacity: lampOn ? 0 : 1 }}
        transition={{ duration: lampOn ? 0.25 : 0.6, ease: "easeOut" }}
      >
        <Image
          src={OFFICE_SCENE.srcLampOff}
          alt=""
          width={OFFICE_SCENE.width}
          height={OFFICE_SCENE.height}
          className="block h-auto w-full"
          sizes="(min-width: 1024px) 1024px, 100vw"
          draggable={false}
        />
        <div className="absolute inset-0 bg-[#0b1020]/20" />
      </motion.div>

      <svg
        viewBox={`0 0 ${OFFICE_SCENE.width} ${OFFICE_SCENE.height}`}
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        {OFFICE_OBJECTS.map((object) => (
          <polygon
            key={object.id}
            points={toPoints(object.hotspot)}
            role="button"
            tabIndex={0}
            aria-label={object.title}
            className={cn(
              "cursor-pointer outline-none transition-all duration-200",
              hoveredId === object.id
                ? "fill-white/25 stroke-white [filter:drop-shadow(0_0_14px_rgba(255,255,255,0.9))]"
                : "fill-transparent stroke-transparent"
            )}
            strokeWidth={6}
            strokeLinejoin="round"
            onMouseEnter={() => setHoveredId(object.id)}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={() => setHoveredId(object.id)}
            onBlur={() => setHoveredId(null)}
            onClick={() => onSelect(object)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") onSelect(object);
            }}
          />
        ))}
      </svg>

      <CoffeeSteam />
      <DeskLamp isOn={lampOn} onToggle={() => setLampOn((on) => !on)} />
      <DeskMouse lampOn={lampOn} />

      <AnimatePresence>
        {hovered && (
          <motion.span
            key={hovered.id}
            className="pointer-events-none absolute flex h-8 w-8 items-center justify-center rounded-lg bg-black text-amber-200"
            style={badgePosition(hovered.hotspot)}
            initial={{ opacity: 0, scale: 0.6, x: 8, y: -8 }}
            animate={{ opacity: 1, scale: 1, x: 8, y: -8 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
          >
            <BulbIcon />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
