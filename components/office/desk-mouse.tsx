"use client";

import {
  PointerEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import cn from "classnames";
import {
  advanceCableSim,
  cablePoints,
  CableSim,
  createCableSim,
  setMouseTarget,
  settleCableSim,
} from "@/lib/office-cable";
import {
  OFFICE_CABLE,
  OFFICE_DESK,
  OFFICE_MOUSE,
  OFFICE_OCCLUDERS,
  OFFICE_SCENE,
} from "@/lib/office-objects";
import { obstacleContact, smoothPath } from "@/lib/office-physics";
import { deskToScene, sceneToDesk } from "@/lib/office-projection";
import { DeskMouseProps, OfficeOccluder, Point } from "@/types";

/** Same off-white plastic as the mouse: a darker edge and a lighter top give it some volume */
const CABLE_COLORS = {
  on: { edge: "#b5a88f", body: "#ddd3bf", highlight: "#f1ebdf" },
  off: { edge: "#9d927c", body: "#c9c0ad", highlight: "#ddd6c8" },
};
/** Height (cm) of the mouse's top, where the hand holds it */
const GRAB_HEIGHT = 2.5;
/** Seconds the first layout is simulated before it's shown, so it starts at rest */
const SETTLE_TIME = 0.5;

const { grommet: GROMMET, keyboardCable: KEYBOARD_CABLE } = OFFICE_CABLE;
const GROMMET_CENTER = deskToScene({ ...OFFICE_CABLE.anchor, z: 0 });
/** The keyboard cable doesn't move, so its path is computed once */
const KEYBOARD_CABLE_PATH = `M ${KEYBOARD_CABLE.start.x} ${KEYBOARD_CABLE.start.y} Q ${KEYBOARD_CABLE.control.x} ${KEYBOARD_CABLE.control.y} ${GROMMET_CENTER.x} ${GROMMET_CENTER.y}`;
/** Front half of the grommet's rim, drawn over the cables so they drop into the hole */
const GROMMET_LIP_PATH = `M ${GROMMET_CENTER.x - GROMMET.radiusX} ${GROMMET_CENTER.y} A ${GROMMET.radiusX} ${GROMMET.radiusY} 0 0 0 ${GROMMET_CENTER.x + GROMMET.radiusX} ${GROMMET_CENTER.y}`;

/** Ground-level path (for the shadow) and the drawn path, which rises at both ends */
function cablePaths(sim: CableSim) {
  const points = cablePoints(sim);
  return {
    shadow: smoothPath(points.map((point) => deskToScene({ ...point, z: 0 }))),
    cable: smoothPath(points.map(deskToScene)),
  };
}

function spriteTransform(mouse: Point) {
  const foot = deskToScene({ ...mouse, z: 0 });
  const x = foot.x - OFFICE_MOUSE.footprintPixel.x;
  const y = foot.y - OFFICE_MOUSE.footprintPixel.y;
  return `translate(${x.toFixed(2)} ${y.toFixed(2)})`;
}

/** Whether the mouse stands in front of a desk object, as seen by the camera */
function isInFront(mouse: Point, occluder: OfficeOccluder) {
  const { normal } = obstacleContact(
    mouse,
    OFFICE_DESK.obstacles[occluder.obstacle]
  );
  // Towards the camera is +x −y on the desk plane
  return normal.x - normal.y > 0;
}

interface CableStrokeProps {
  colors: (typeof CABLE_COLORS)["on"];
  path?: string;
  pathRef?: (element: SVGPathElement | null) => void;
}

/** A plastic cable: darker edge, body and a thin highlight */
function CableStroke({ colors, path, pathRef }: CableStrokeProps) {
  const layers = [
    { stroke: colors.edge, width: 5.5 },
    { stroke: colors.body, width: 4 },
    {
      stroke: colors.highlight,
      width: 1.4,
      transform: "translate(-0.6 -0.9)",
      opacity: 0.8,
    },
  ];
  return (
    <>
      {layers.map((layer) => (
        <path
          key={layer.width}
          ref={pathRef}
          d={path}
          fill="none"
          stroke={layer.stroke}
          strokeWidth={layer.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={layer.transform}
          opacity={layer.opacity}
        />
      ))}
    </>
  );
}

interface OccluderProps {
  occluder: OfficeOccluder;
  clipId: string;
  lampOn: boolean;
  slotRef: (element: SVGGElement | null) => void;
}

const SCENE_SIZE = { width: OFFICE_SCENE.width, height: OFFICE_SCENE.height };

/** Clip path or alpha mask that cuts one desk object out of the scene image */
function OccluderCut({
  occluder,
  id,
}: {
  occluder: OfficeOccluder;
  id: string;
}) {
  if (occluder.mask) {
    return (
      <mask
        id={id}
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        {...SCENE_SIZE}
        style={{ maskType: "alpha" }}
      >
        <image href={occluder.mask} {...SCENE_SIZE} />
      </mask>
    );
  }
  return (
    <clipPath id={id}>
      <polygon points={occluder.polygon?.join(" ")} />
    </clipPath>
  );
}

/** The scene image cut to one desk object, in both lamp states like the scene below */
function Occluder({ occluder, clipId, lampOn, slotRef }: OccluderProps) {
  const cut = occluder.mask
    ? { mask: `url(#${clipId})` }
    : { clipPath: `url(#${clipId})` };
  const size = SCENE_SIZE;

  return (
    <g ref={slotRef} {...cut}>
      <image href={OFFICE_SCENE.src} {...size} />
      <g
        className={cn(
          "transition-opacity",
          lampOn ? "duration-700" : "duration-[400ms]"
        )}
        style={{ opacity: lampOn ? 0 : 1 }}
      >
        <image href={OFFICE_SCENE.srcLampOff} {...size} />
        <rect {...size} fill="#0b1020" opacity={0.15} />
      </g>
    </g>
  );
}

export default function DeskMouse({ lampOn }: DeskMouseProps) {
  const clipPrefix = useId().replace(/:/g, "");
  // A mutable simulation that lives as long as the component; it's never replaced
  const [sim] = useState(() => {
    const fresh = createCableSim();
    settleCableSim(fresh, SETTLE_TIME);
    return fresh;
  });
  /** First frame for the server render; after that the loop writes to the DOM */
  const [initial] = useState(() => ({
    ...cablePaths(sim),
    mouse: spriteTransform(sim.mouse),
  }));
  const svgRef = useRef<SVGSVGElement>(null);
  const shadowRef = useRef<SVGPathElement>(null);
  const cableRefs = useRef<SVGPathElement[]>([]);
  const mouseRef = useRef<SVGGElement>(null);
  /** Each occluder twice: below the mouse [0] and above it [1]; one is hidden */
  const occluderRefs = useRef<(SVGGElement | null)[][]>(
    OFFICE_OCCLUDERS.map(() => [null, null])
  );
  const grabOffset = useRef<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const wakeRef = useRef<() => void>(() => undefined);

  const render = useCallback(() => {
    const { shadow, cable } = cablePaths(sim);
    shadowRef.current?.setAttribute("d", shadow);
    cableRefs.current.forEach((path) => path.setAttribute("d", cable));
    mouseRef.current?.setAttribute("transform", spriteTransform(sim.mouse));
    OFFICE_OCCLUDERS.forEach((occluder, index) => {
      const front = isInFront(sim.mouse, occluder);
      const [below, above] = occluderRefs.current[index];
      below?.setAttribute("display", front ? "inline" : "none");
      above?.setAttribute("display", front ? "none" : "inline");
    });
  }, [sim]);

  // Fixed-step simulation on requestAnimationFrame that stops once everything is still
  useEffect(() => {
    let frame = 0;
    let running = false;
    let last = 0;
    const tick = (time: number) => {
      advanceCableSim(sim, (time - last) / 1000);
      last = time;
      render();
      if (sim.asleep) {
        running = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    wakeRef.current = () => {
      if (running) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    render();
    wakeRef.current();
    return () => cancelAnimationFrame(frame);
  }, [render, sim]);

  /** The pointer on the desk plane, at the height where the hand holds the mouse */
  const toDeskPoint = (event: PointerEvent) => {
    const matrix = svgRef.current?.getScreenCTM()?.inverse();
    if (!matrix) return null;
    const scene = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix
    );
    return sceneToDesk({ x: scene.x, y: scene.y }, GRAB_HEIGHT);
  };

  const handlePointerDown = (event: PointerEvent<SVGImageElement>) => {
    const point = toDeskPoint(event);
    if (!point) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    grabOffset.current = { x: sim.mouse.x - point.x, y: sim.mouse.y - point.y };
    setIsDragging(true);
    setMouseTarget(sim, { ...sim.mouse });
    wakeRef.current();
  };

  const handlePointerMove = (event: PointerEvent<SVGImageElement>) => {
    if (!isDragging) return;
    const point = toDeskPoint(event);
    if (!point) return;
    setMouseTarget(sim, {
      x: point.x + grabOffset.current.x,
      y: point.y + grabOffset.current.y,
    });
    wakeRef.current();
  };

  const handlePointerUp = (event: PointerEvent<SVGImageElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);
    setMouseTarget(sim, null);
    wakeRef.current();
  };

  const colors = lampOn ? CABLE_COLORS.on : CABLE_COLORS.off;
  const occluderSlot = (layer: 0 | 1) =>
    OFFICE_OCCLUDERS.map((occluder, index) => (
      <Occluder
        key={occluder.id}
        occluder={occluder}
        clipId={`${clipPrefix}-${occluder.id}`}
        lampOn={lampOn}
        slotRef={(element) => {
          occluderRefs.current[index][layer] = element;
        }}
      />
    ));

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${OFFICE_SCENE.width} ${OFFICE_SCENE.height}`}
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
    >
      <defs>
        {OFFICE_OCCLUDERS.map((occluder) => (
          <OccluderCut
            key={occluder.id}
            occluder={occluder}
            id={`${clipPrefix}-${occluder.id}`}
          />
        ))}
      </defs>

      <ellipse
        cx={GROMMET_CENTER.x}
        cy={GROMMET_CENTER.y}
        rx={GROMMET.radiusX}
        ry={GROMMET.radiusY}
        fill="#1c140e"
        stroke="#5c4028"
        strokeWidth={2}
      />
      <path
        d={KEYBOARD_CABLE_PATH}
        fill="none"
        stroke="rgba(55,30,12,0.3)"
        strokeWidth={6}
        transform="translate(1.5 4)"
        strokeLinecap="round"
      />
      <CableStroke path={KEYBOARD_CABLE_PATH} colors={colors} />
      {/* Contact shadow: it stays on the desk while the cable's ends rise off it */}
      <path
        ref={shadowRef}
        d={initial.shadow}
        fill="none"
        stroke="rgba(55,30,12,0.3)"
        strokeWidth={6}
        transform="translate(1.5 4)"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <CableStroke
        colors={colors}
        path={initial.cable}
        pathRef={(element) => {
          if (element && !cableRefs.current.includes(element)) {
            cableRefs.current.push(element);
          }
        }}
      />
      <path
        d={GROMMET_LIP_PATH}
        fill="none"
        stroke="#6b4a2e"
        strokeWidth={2.5}
      />

      {occluderSlot(0)}
      <g ref={mouseRef} transform={initial.mouse}>
        <image
          href={OFFICE_MOUSE.src}
          width={OFFICE_MOUSE.width}
          height={OFFICE_MOUSE.height}
          role="slider"
          aria-label="Desk mouse, drag it around"
          aria-valuetext="Mouse position"
          className={cn(
            "pointer-events-auto touch-none select-none transition-[filter] duration-500",
            isDragging ? "cursor-grabbing" : "cursor-grab",
            lampOn ? "brightness-100" : "brightness-90"
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </g>
      {occluderSlot(1)}
    </svg>
  );
}
