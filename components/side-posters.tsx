"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import cn from "classnames";
import { useFlipPresence } from "@/lib/use-flip-presence";
import type { FlipOrigin } from "@/types";

/** Positions are viewport percentages so the posters stay put while scrolling */
const POSTERS = [
  {
    src: "/posters/think-different-v2.webp",
    alt: "Think Different poster with the Crazy Ones quote by Steve Jobs",
    width: 1100,
    height: 1500,
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

type Poster = (typeof POSTERS)[number];

const subscribeNoop = () => () => {};
const isClient = () => true;
const isServer = () => false;

interface PosterLightboxProps {
  poster: Poster;
  onClose: () => void;
  /** The poster on the wall, which this one lifts off and goes back to */
  getOrigin: FlipOrigin;
}

/** An element's own box around its middle, whatever it's rotated or scaled by */
function restingRect(element: HTMLElement) {
  const box = element.getBoundingClientRect();
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  return new DOMRect(
    box.left + (box.width - width) / 2,
    box.top + (box.height - height) / 2,
    width,
    height
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The poster at full size over a blurred backdrop; click outside or Esc to
 * close. It lifts off the wall to open and goes back to its place to close.
 */
function PosterLightbox({ poster, onClose, getOrigin }: PosterLightboxProps) {
  const panelRef = useFlipPresence<HTMLDivElement>({
    getOrigin,
    rotate: poster.rotate,
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
        aria-label={poster.alt}
        className="relative rounded-xl border border-white/10 bg-neutral-900/80 p-1.5 opacity-0"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close poster"
          className="absolute right-2.5 top-2.5 z-10 rounded-full bg-black/50 p-1.5 text-white/80 transition-colors hover:bg-black/80 hover:text-white"
        >
          <CloseIcon />
        </button>
        <Image
          src={poster.src}
          alt={poster.alt}
          width={poster.width}
          height={poster.height}
          className="block max-h-[82vh] w-auto rounded-lg"
          unoptimized
        />
      </div>
    </div>
  );
}

/** Taped posters fixed in the empty right margin, only on wide screens */
export default function SidePosters() {
  const [open, setOpen] = useState<Poster | null>(null);
  /** The poster that's off the wall: from the click until it's back in place */
  const [lifted, setLifted] = useState<string | null>(null);
  const paperRefs = useRef(new Map<string, HTMLElement>());
  const close = useCallback(() => setOpen(null), []);
  const lift = (poster: Poster) => {
    setOpen(poster);
    setLifted(poster.src);
  };
  // The lightbox is portaled to <body>, which only exists on the client
  const isMounted = useSyncExternalStore(subscribeNoop, isClient, isServer);
  const isOpen = open !== null;

  // Locks page scroll and listens for Esc only while a poster is open
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  return (
    <>
      <div className="pointer-events-none fixed inset-y-0 right-0 z-30 hidden w-[calc((100vw-48rem)/2)] min-[1400px]:block">
        {POSTERS.map((poster, index) => (
          <motion.button
            key={poster.src}
            type="button"
            onClick={() => lift(poster)}
            aria-label={`Open poster: ${poster.alt}`}
            className="pointer-events-auto absolute cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
            style={{ top: poster.top, right: poster.right, width: poster.size }}
            initial={{ opacity: 0, y: 12, rotate: poster.rotate }}
            animate={{ opacity: 1, y: 0, rotate: poster.rotate }}
            whileHover={{ rotate: 0, scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 18,
              delay: 0.3 + index * 0.1,
            }}
          >
            {/* The tape stays on the wall while the poster is off it */}
            <span
              aria-hidden
              className={`absolute -top-2.5 z-10 h-5 w-14 bg-[#a89a7c]/55 ${poster.tape}`}
            />
            <span
              ref={(element) => {
                if (element) paperRefs.current.set(poster.src, element);
              }}
              className={cn(
                "relative block rounded-[3px] border border-white/10 bg-[#2a2a30] p-1.5 shadow-[0_14px_24px_-10px_rgba(0,0,0,0.7)]",
                lifted === poster.src && "invisible"
              )}
            >
              <Image
                src={poster.src}
                alt=""
                width={poster.width}
                height={poster.height}
                className="block h-auto w-full rounded-[2px]"
                unoptimized
              />
            </span>
          </motion.button>
        ))}
      </div>
      {isMounted &&
        createPortal(
          <AnimatePresence onExitComplete={() => setLifted(null)}>
            {open && (
              <PosterLightbox
                key={open.src}
                poster={open}
                onClose={close}
                getOrigin={() => {
                  const paper = paperRefs.current.get(open.src);
                  return paper ? restingRect(paper) : null;
                }}
              />
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
