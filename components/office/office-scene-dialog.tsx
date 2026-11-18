"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFlipPresence } from "@/lib/use-flip-presence";
import OfficeObjectDialog from "@/components/office/office-object-dialog";
import OfficeScene from "@/components/office/office-scene";
import { OfficeObject, OfficeSceneDialogProps } from "@/types";

/** The polaroid hangs a little crooked: the scene straightens up as it opens */
const POLAROID_TILT = -3;

export default function OfficeSceneDialog({
  onClose,
  getOrigin,
}: OfficeSceneDialogProps) {
  const [selected, setSelected] = useState<OfficeObject | null>(null);
  const panelRef = useFlipPresence<HTMLDivElement>({
    getOrigin,
    rotate: POLAROID_TILT,
  });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (selected) {
        setSelected(null);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="My office"
        className="relative w-[min(100%,calc((100dvh-7rem)*1.124))] max-w-5xl opacity-0"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="font-hand text-sm text-neutral-300">
            my office · hover, click and drag things ✎
          </p>
          <button
            type="button"
            onClick={onClose}
            className="link-mono"
            aria-label="Close my office"
          >
            close ✕
          </button>
        </div>

        <OfficeScene onSelect={setSelected} />
      </div>

      <AnimatePresence>
        {selected && (
          <OfficeObjectDialog
            object={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
