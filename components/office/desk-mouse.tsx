"use client";

import { PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import cn from "classnames";
import { OFFICE_MOUSE, OFFICE_SCENE } from "@/lib/office-objects";
import {
  cableControlPoint,
  clampToPolygon,
  limitDistance,
  pushOutOfCircles,
} from "@/lib/office-physics";
import { DeskMouseProps, Point } from "@/types";

const HALF_SIZE = { x: OFFICE_MOUSE.width / 2, y: OFFICE_MOUSE.height / 2 };
const START_CENTER = {
  x: OFFICE_MOUSE.start.x + HALF_SIZE.x,
  y: OFFICE_MOUSE.start.y + HALF_SIZE.y,
};
/** How far the mouse springs back when the cable runs out, in scene pixels */
const TUG_RECOIL = 14;
const CABLE_SPRING = 0.18;
const CABLE_DAMPING = 0.82;

const toPercent = (value: number, total: number) => `${(value / total) * 100}%`;

const cableEnd = (center: Point): Point => ({
  x: center.x - HALF_SIZE.x + OFFICE_MOUSE.cableOffset.x,
  y: center.y - HALF_SIZE.y + OFFICE_MOUSE.cableOffset.y,
});

/** Applies the desk, obstacle and cable-length rules to a desired mouse center */
function constrain(target: Point) {
  const onDesk = pushOutOfCircles(
    clampToPolygon(target, OFFICE_MOUSE.deskArea),
    OFFICE_MOUSE.obstacles
  );
  const end = cableEnd(onDesk);
  const limited = limitDistance(
    OFFICE_MOUSE.cableAnchor,
    end,
    OFFICE_MOUSE.cableLength
  );
  if (!limited.atLimit) return { center: onDesk, atLimit: false };
  return {
    center: {
      x: onDesk.x + (limited.point.x - end.x),
      y: onDesk.y + (limited.point.y - end.y),
    },
    atLimit: true,
  };
}

export default function DeskMouse({ lampOn }: DeskMouseProps) {
  const [center, setCenter] = useState<Point>(START_CENTER);
  const [wobble, setWobble] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isTugging, setIsTugging] = useState(false);
  const spriteRef = useRef<HTMLDivElement>(null);
  const grabOffset = useRef<Point>({ x: 0, y: 0 });
  const wobbleVelocity = useRef(0);
  const wobbleValue = useRef(0);
  const previousCenter = useRef<Point>(START_CENTER);
  const wasAtLimit = useRef(false);

  // The cable sways with the mouse's movement and settles with a damped spring
  useEffect(() => {
    let frame = 0;
    const step = () => {
      wobbleVelocity.current =
        (wobbleVelocity.current - wobbleValue.current * CABLE_SPRING) *
        CABLE_DAMPING;
      wobbleValue.current += wobbleVelocity.current;
      if (
        Math.abs(wobbleValue.current) > 0.05 ||
        Math.abs(wobbleVelocity.current) > 0.05
      ) {
        setWobble(wobbleValue.current);
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  const toScenePoint = useCallback((event: PointerEvent) => {
    const scene = spriteRef.current?.parentElement;
    if (!scene) return null;
    const rect = scene.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * OFFICE_SCENE.width,
      y: ((event.clientY - rect.top) / rect.height) * OFFICE_SCENE.height,
    };
  }, []);

  const tug = useCallback(() => {
    setIsTugging(true);
    wobbleVelocity.current -= 9;
    window.setTimeout(() => setIsTugging(false), 320);
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const point = toScenePoint(event);
    if (!point) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    grabOffset.current = { x: center.x - point.x, y: center.y - point.y };
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const point = toScenePoint(event);
    if (!point) return;

    const { center: next, atLimit } = constrain({
      x: point.x + grabOffset.current.x,
      y: point.y + grabOffset.current.y,
    });

    const movement =
      next.x - previousCenter.current.x + (next.y - previousCenter.current.y);
    wobbleVelocity.current += movement * 0.25;
    previousCenter.current = next;

    if (atLimit && !wasAtLimit.current) tug();
    wasAtLimit.current = atLimit;
    setCenter(next);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);
    wasAtLimit.current = false;
  };

  const end = cableEnd(center);
  const control = cableControlPoint(
    OFFICE_MOUSE.cableAnchor,
    end,
    OFFICE_MOUSE.cableLength * 0.62,
    wobble
  );
  const { cableAnchor } = OFFICE_MOUSE;
  const cablePath = `M ${cableAnchor.x} ${cableAnchor.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;

  // Recoil towards the anchor while the cable is taut
  const recoilAngle = Math.atan2(cableAnchor.y - end.y, cableAnchor.x - end.x);
  const recoil = isTugging
    ? {
        x: Math.cos(recoilAngle) * TUG_RECOIL,
        y: Math.sin(recoilAngle) * TUG_RECOIL,
      }
    : { x: 0, y: 0 };

  return (
    <>
      <svg
        viewBox={`0 0 ${OFFICE_SCENE.width} ${OFFICE_SCENE.height}`}
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d={cablePath}
          fill="none"
          stroke="rgba(60,35,15,0.28)"
          strokeWidth={7}
          transform="translate(2 5)"
          strokeLinecap="round"
        />
        <path
          d={cablePath}
          fill="none"
          stroke={lampOn ? "#efe9dc" : "#d9d3c6"}
          strokeWidth={5}
          strokeLinecap="round"
          className="transition-[stroke] duration-500"
        />
      </svg>

      <div
        ref={spriteRef}
        role="slider"
        aria-label="Desk mouse, drag it around"
        aria-valuetext="Mouse position"
        tabIndex={-1}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={cn(
          "absolute touch-none select-none transition-[filter] duration-500",
          isDragging ? "cursor-grabbing" : "cursor-grab",
          lampOn ? "brightness-100" : "brightness-90"
        )}
        style={{
          left: toPercent(
            center.x - HALF_SIZE.x + recoil.x,
            OFFICE_SCENE.width
          ),
          top: toPercent(
            center.y - HALF_SIZE.y + recoil.y,
            OFFICE_SCENE.height
          ),
          width: toPercent(OFFICE_MOUSE.width, OFFICE_SCENE.width),
          transition: isTugging
            ? "left 160ms ease-out, top 160ms ease-out"
            : undefined,
        }}
      >
        <img
          src={OFFICE_MOUSE.src}
          alt=""
          draggable={false}
          className={cn(
            "block h-auto w-full transition-transform duration-150",
            isDragging &&
              "-translate-y-[3%] scale-105 drop-shadow-[0_6px_6px_rgba(0,0,0,0.35)]"
          )}
        />
      </div>
    </>
  );
}
