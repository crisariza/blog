"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import OfficeObjectDialog from "@/components/office/office-object-dialog";
import OfficeScene from "@/components/office/office-scene";
import { OfficeObject, OfficeSceneDialogProps } from "@/types";

export default function OfficeSceneDialog({ onClose }: OfficeSceneDialogProps) {
  const [selected, setSelected] = useState<OfficeObject | null>(null);

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
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="My office"
        className="relative w-[min(100%,calc((100dvh-7rem)*1.34))] max-w-5xl"
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(event) => event.stopPropagation()}
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
      </motion.div>

      <AnimatePresence>
        {selected && (
          <OfficeObjectDialog
            object={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
