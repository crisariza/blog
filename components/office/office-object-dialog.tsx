"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import ObjectViewer from "@/components/office/object-viewer";
import RichText from "@/components/office/rich-text";
import { OfficeObjectDialogProps } from "@/types";

export default function OfficeObjectDialog({
  object,
  onClose,
}: OfficeObjectDialogProps) {
  const isExternal = object.link?.href.startsWith("http");

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${object.id}-title`}
        className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-white/10 bg-[#f4f2ed] shadow-elevated"
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-64" style={{ background: object.backdrop }}>
          <ObjectViewer model={object.model} />
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Close"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
          >
            <span aria-hidden className="text-lg leading-none">
              ×
            </span>
          </button>
          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center font-mono text-[10px] text-white/60">
            Drag to explore · 360°
          </p>
        </div>

        <div className="space-y-3 p-6 font-mono text-neutral-800">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Objects in my office
          </p>
          <h2
            id={`${object.id}-title`}
            className="text-lg leading-snug text-neutral-900"
          >
            {object.title}
          </h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            <RichText segments={object.description} />
          </p>
          {object.photo && (
            <figure className="space-y-2 pt-1">
              <Image
                src={object.photo.src}
                alt={object.photo.alt}
                width={object.photo.width}
                height={object.photo.height}
                className="h-auto w-full rounded-lg"
              />
              <figcaption className="text-[11px] text-neutral-500">
                {object.photo.caption}
              </figcaption>
            </figure>
          )}
          {object.link && (
            <Link
              href={object.link.href}
              target={isExternal ? "_blank" : undefined}
              className="inline-flex items-center gap-1 text-sm text-neutral-800 underline decoration-neutral-400 underline-offset-4 transition-colors hover:text-neutral-950"
            >
              {object.link.label}
              <span aria-hidden>↗</span>
            </Link>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
