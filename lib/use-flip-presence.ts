"use client";

import { useEffect, useRef } from "react";
import { useAnimate, usePresence, useReducedMotion } from "framer-motion";
import type { FlipOrigin } from "@/types";

/** Opening: a spring that settles without bouncing past its place */
const OPEN_TRANSITION = {
  type: "spring",
  stiffness: 240,
  damping: 30,
} as const;
/** Closing is the same trip back, a little quicker */
const CLOSE_TRANSITION = { duration: 0.3, ease: [0.4, 0, 0.2, 1] } as const;
/** The overlay is see-through only at the very start (and end) of the trip */
const FADE_TIMES = [0, 0.35, 1];
const REDUCED_FADE = { duration: 0.15 };

interface FlipOptions {
  /** The element on the page the overlay grows out of and shrinks back into */
  getOrigin: FlipOrigin;
  /** Tilt of that element, in degrees, to start and end at */
  rotate?: number;
}

/** Where the origin sits relative to the overlay's own place, as a transform */
function offsetFrom(origin: DOMRect, place: DOMRect, rotate: number) {
  return {
    x: origin.left + origin.width / 2 - (place.left + place.width / 2),
    y: origin.top + origin.height / 2 - (place.top + place.height / 2),
    scale: origin.width / place.width,
    rotate,
  };
}

/**
 * Makes an overlay grow out of an element on the page and shrink back into
 * it when it's closed. Attach the returned ref to the overlay and render it
 * with `opacity: 0`, as a direct child of an `AnimatePresence`.
 */
export function useFlipPresence<T extends HTMLElement>({
  getOrigin,
  rotate = 0,
}: FlipOptions) {
  const [scope, animate] = useAnimate<T>();
  const [isPresent, safeToRemove] = usePresence();
  const isReduced = useReducedMotion();
  /** The overlay's resting place, measured before anything moves it */
  const place = useRef<DOMRect | null>(null);

  useEffect(() => {
    const node = scope.current;
    if (!node) return;
    place.current ??= node.getBoundingClientRect();
    const origin = getOrigin();
    const leave = () => safeToRemove?.();

    if (isReduced || !origin) {
      const fade = animate(node, { opacity: isPresent ? 1 : 0 }, REDUCED_FADE);
      if (!isPresent) void fade.then(leave);
      return;
    }

    const from = offsetFrom(origin, place.current, rotate);
    if (isPresent) {
      void animate(
        node,
        {
          x: [from.x, 0],
          y: [from.y, 0],
          scale: [from.scale, 1],
          rotate: [from.rotate, 0],
        },
        OPEN_TRANSITION
      );
      void animate(
        node,
        { opacity: [0, 1, 1] },
        { duration: 0.3, times: FADE_TIMES }
      );
      return;
    }
    void animate(
      node,
      { opacity: [1, 1, 0] },
      { duration: CLOSE_TRANSITION.duration, times: [0, 0.65, 1] }
    );
    void animate(node, from, CLOSE_TRANSITION).then(leave);
    // The trip is set up once each way: when the overlay shows up and when it leaves
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresent]);

  return scope;
}
