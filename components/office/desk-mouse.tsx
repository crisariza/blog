"use client";

import { PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import cn from "classnames";
import { OFFICE_MOUSE, OFFICE_SCENE } from "@/lib/office-objects";
import {
  cableControlPoint,
  clampToPolygon,
  limitDistance,
  pushOutOfEllipses,
  routeCable,
  smoothPath,
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
/** Same off-white plastic as the mouse: a darker edge and a lighter top give it some volume */
const CABLE_COLORS = {
  on: { edge: "#b5a88f", body: "#ddd3bf", highlight: "#f1ebdf" },
  off: { edge: "#9d927c", body: "#c9c0ad", highlight: "#ddd6c8" },
};

const toPercent = (value: number, total: number) => `${(value / total) * 100}%`;

const {
  cableAnchor: GROMMET_CENTER,
  grommet: GROMMET,
  keyboardCable: KEYBOARD_CABLE,
} = OFFICE_MOUSE;
/** The keyboard cable doesn't move, so its path is computed once */
const KEYBOARD_CABLE_PATH = `M ${KEYBOARD_CABLE.start.x} ${KEYBOARD_CABLE.start.y} Q ${KEYBOARD_CABLE.control.x} ${KEYBOARD_CABLE.control.y} ${GROMMET_CENTER.x} ${GROMMET_CENTER.y}`;
/** Front half of the grommet's rim, drawn over the cables so they drop into the hole */
const GROMMET_LIP_PATH = `M ${GROMMET_CENTER.x - GROMMET.radiusX} ${GROMMET_CENTER.y} A ${GROMMET.radiusX} ${GROMMET.radiusY} 0 0 0 ${GROMMET_CENTER.x + GROMMET.radiusX} ${GROMMET_CENTER.y}`;

interface CableStrokeProps {
  path: string;
  colors: (typeof CABLE_COLORS)["on"];
}

/** A plastic cable: soft shadow, darker edge, body and a thin highlight */
function CableStroke({ path, colors }: CableStrokeProps) {
  return (
    <>
      <path
        d={path}
        fill="none"
        stroke="rgba(55,30,12,0.3)"
        strokeWidth={6}
        transform="translate(1.5 4)"
        strokeLinecap="round"
      />
      <path
        d={path}
        fill="none"
        stroke={colors.edge}
        strokeWidth={5.5}
        strokeLinecap="round"
      />
      <path
        d={path}
        fill="none"
        stroke={colors.body}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d={path}
        fill="none"
        stroke={colors.highlight}
        strokeWidth={1.4}
        strokeLinecap="round"
        transform="translate(-0.6 -0.9)"
        opacity={0.8}
      />
    </>
  );
}

const cableEnd = (center: Point): Point => ({
  x: center.x - HALF_SIZE.x + OFFICE_MOUSE.cableOffset.x,
  y: center.y - HALF_SIZE.y + OFFICE_MOUSE.cableOffset.y,
});

/** Applies the desk, obstacle and cable-length rules to a desired mouse center */
function constrain(target: Point) {
  const onDesk = pushOutOfEllipses(
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
  const [recoilAmount, setRecoilAmount] = useState(0);
  const spriteRef = useRef<HTMLDivElement>(null);
  const grabOffset = useRef<Point>({ x: 0, y: 0 });
  const wobbleVelocity = useRef(0);
  const wobbleValue = useRef(0);
  const previousCenter = useRef<Point>(START_CENTER);
  const wasAtLimit = useRef(false);
  const recoilValue = useRef(0);
  const recoilVelocity = useRef(0);

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
      // The recoil after a tug is a stiffer spring back to rest
      recoilVelocity.current =
        (recoilVelocity.current - recoilValue.current * 0.3) * 0.72;
      recoilValue.current += recoilVelocity.current;
      if (
        Math.abs(recoilValue.current) > 0.05 ||
        Math.abs(recoilVelocity.current) > 0.05
      ) {
        setRecoilAmount(recoilValue.current);
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
    wobbleVelocity.current -= 9;
    recoilVelocity.current += TUG_RECOIL * 0.6;
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

  const { cableAnchor } = OFFICE_MOUSE;

  // Recoil towards the anchor while the cable is taut
  const restingEnd = cableEnd(center);
  const recoilAngle = Math.atan2(
    cableAnchor.y - restingEnd.y,
    cableAnchor.x - restingEnd.x
  );
  const recoil = {
    x: Math.cos(recoilAngle) * recoilAmount,
    y: Math.sin(recoilAngle) * recoilAmount,
  };

  // The cable always ends exactly where the mouse is drawn
  const drawnCenter = { x: center.x + recoil.x, y: center.y + recoil.y };
  const end = cableEnd(drawnCenter);
  const control = cableControlPoint(
    cableAnchor,
    end,
    OFFICE_MOUSE.cableLength * 0.62,
    wobble
  );
  const cablePath = smoothPath(
    routeCable(cableAnchor, control, end, OFFICE_MOUSE.cableObstacles)
  );
  const colors = lampOn ? CABLE_COLORS.on : CABLE_COLORS.off;

  return (
    <>
      <svg
        viewBox={`0 0 ${OFFICE_SCENE.width} ${OFFICE_SCENE.height}`}
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <ellipse
          cx={GROMMET_CENTER.x}
          cy={GROMMET_CENTER.y}
          rx={GROMMET.radiusX}
          ry={GROMMET.radiusY}
          fill="#1c140e"
          stroke="#5c4028"
          strokeWidth={2}
        />
        <CableStroke path={KEYBOARD_CABLE_PATH} colors={colors} />
        <CableStroke path={cablePath} colors={colors} />
        <path
          d={GROMMET_LIP_PATH}
          fill="none"
          stroke="#6b4a2e"
          strokeWidth={2.5}
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
          left: toPercent(drawnCenter.x - HALF_SIZE.x, OFFICE_SCENE.width),
          top: toPercent(drawnCenter.y - HALF_SIZE.y, OFFICE_SCENE.height),
          width: toPercent(OFFICE_MOUSE.width, OFFICE_SCENE.width),
        }}
      >
        <img
          src={OFFICE_MOUSE.src}
          alt=""
          draggable={false}
          className={cn(
            "block h-auto w-full transition-[filter] duration-150",
            isDragging && "drop-shadow-[0_3px_3px_rgba(0,0,0,0.3)]"
          )}
        />
      </div>
    </>
  );
}
