"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import OfficeSceneDialog from "@/components/office/office-scene-dialog";
import { OFFICE_SCENE } from "@/lib/office-objects";
import { preloadOfficeScene } from "@/lib/office-preload";

/** How long after the page shows up the full scene starts downloading (ms) */
const PRELOAD_DELAY = 1200;

const preload = () => void preloadOfficeScene();

export default function OfficePolaroid() {
  const [isOpen, setIsOpen] = useState(false);
  const photoRef = useRef<HTMLImageElement>(null);
  const getOrigin = useCallback(
    () => photoRef.current?.getBoundingClientRect() ?? null,
    []
  );

  // The scene is fetched while the visitor reads the hero, so it opens instantly
  useEffect(() => {
    const timer = window.setTimeout(preload, PRELOAD_DELAY);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="relative w-44 shrink-0 sm:w-52">
        <span
          aria-hidden
          className="absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 -rotate-2 bg-amber-200/25 backdrop-blur-[1px]"
        />
        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          onPointerEnter={preload}
          onFocus={preload}
          aria-label="Open my office"
          className="block w-full -rotate-3 rounded-sm bg-neutral-100 p-2 pb-7 text-left shadow-elevated outline-none focus-visible:ring-2 focus-visible:ring-accent"
          whileHover={{ rotate: 0, scale: 1.03 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Image
            ref={photoRef}
            src={OFFICE_SCENE.polaroidSrc}
            alt={OFFICE_SCENE.alt}
            width={OFFICE_SCENE.polaroidSize}
            height={OFFICE_SCENE.polaroidSize}
            className="aspect-square w-full object-cover"
            unoptimized
            priority
          />
        </motion.button>
        <p className="mt-3 text-center font-hand text-xs text-neutral-500">
          ✎ click to explore
        </p>
      </div>

      <AnimatePresence>
        {isOpen && (
          <OfficeSceneDialog
            onClose={() => setIsOpen(false)}
            getOrigin={getOrigin}
          />
        )}
      </AnimatePresence>
    </>
  );
}
