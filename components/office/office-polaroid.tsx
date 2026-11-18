"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import OfficeSceneDialog from "@/components/office/office-scene-dialog";
import { OFFICE_SCENE } from "@/lib/office-objects";

export default function OfficePolaroid() {
  const [isOpen, setIsOpen] = useState(false);

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
          aria-label="Open my office"
          className="block w-full -rotate-3 rounded-sm bg-neutral-100 p-2 pb-9 text-left shadow-elevated outline-none focus-visible:ring-2 focus-visible:ring-accent"
          whileHover={{ rotate: 0, scale: 1.03 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Image
            src={OFFICE_SCENE.polaroidSrc}
            alt={OFFICE_SCENE.alt}
            width={OFFICE_SCENE.width}
            height={OFFICE_SCENE.height}
            className="aspect-square w-full object-cover object-[48%_45%]"
            sizes="208px"
            priority
          />
          <span className="absolute inset-x-0 bottom-2 text-center font-hand text-lg text-neutral-800">
            cris
          </span>
        </motion.button>
        <p className="mt-3 text-center font-hand text-xs text-neutral-500">
          ✎ click to explore
        </p>
      </div>

      <AnimatePresence>
        {isOpen && <OfficeSceneDialog onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
