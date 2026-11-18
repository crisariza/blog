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
import { deskToScene, sceneToDesk, SCENE_AXES } from "@/lib/office-projection";
import { createCableSound } from "@/lib/office-sound";
import { CableSound, DeskMouseProps, OfficeOccluder, Point } from "@/types";

/** Same off-white plastic as the mouse: a darker edge and a lighter top give it some volume */
const CABLE_COLORS = {
  on: {
    edge: "#a8997e",
    body: "#d9cdb6",
    shade: "#b3a488",
    highlight: "#f0e8d8",
  },
  off: {
    edge: "#93876f",
    body: "#c5baa4",
    shade: "#a3967d",
    highlight: "#dad1c0",
  },
};
/**
 * The cable's strokes, bottom to top. The scene is a soft render, so its edge
 * is feathered with a wider, fainter stroke instead of a crisp vector line.
 */
const CABLE_LAYERS = [
  { id: "feather", color: "edge", width: 6.6, opacity: 0.35 },
  { id: "edge", color: "edge", width: 5.4 },
  { id: "body", color: "body", width: 4 },
  {
    id: "shade",
    color: "shade",
    width: 1.6,
    opacity: 0.55,
    transform: "translate(0.7 1)",
  },
  {
    id: "highlight",
    color: "highlight",
    width: 1.3,
    opacity: 0.85,
    transform: "translate(-0.6 -0.9)",
  },
] as const;
/** Soft contact shadow: wide and faint to narrow and darker, like a blur */
const SHADOW_LAYERS = [
  { width: 11, opacity: 0.07 },
  { width: 7.5, opacity: 0.1 },
  { width: 4.5, opacity: 0.16 },
];
const SHADOW_COLOR = "rgb(48,24,8)";
const SHADOW_OFFSET = "translate(1.5 3.5)";
/** Height (cm) of the mouse's top, where the hand holds it */
const GRAB_HEIGHT = 2.5;
/** Seconds the first layout is simulated before it's shown, so it starts at rest */
const SETTLE_TIME = 0.5;

/** How much thinner a cable at full stretch is drawn */
const TAUT_THINNING = 0.16;
/** Share of the way the drawn tension moves towards the real one each frame */
const TENSION_SMOOTHING = 0.25;
/** Tension from which the cursor shows the mouse can't go any further */
const STOP_TENSION = 0.97;
/** How far past the mouse (cm) the hand has to pull for the cable to creak at full volume */
const FULL_STRAIN_PULL = 2.5;
/** Slowest hit against the cable's stop (cm/s) that thuds and shakes the mouse */
const IMPACT_SPEED = 18;
/** The mouse's shudder when the cable stops it: scene pixels, decaying over milliseconds */
const SHAKE = { amplitude: 2.4, fullSpeed: 90, decay: 80, frequency: 0.07 };
/** The mouse's shadow on the desk, in sprite pixels */
const MOUSE_SHADOW = { cx: 52, cy: 55, rx: 43, ry: 20, angle: -27 };

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

function spriteTransform(mouse: Point, nudge: Point = { x: 0, y: 0 }) {
  const foot = deskToScene({ ...mouse, z: 0 });
  const x = foot.x - OFFICE_MOUSE.footprintPixel.x + nudge.x;
  const y = foot.y - OFFICE_MOUSE.footprintPixel.y + nudge.y;
  return `translate(${x.toFixed(2)} ${y.toFixed(2)})`;
}

/** How hard the hand is pulling against the cable, 0 to 1: that's what makes it creak */
function strainOf(sim: CableSim) {
  if (!sim.target) return 0;
  const pull = Math.hypot(
    sim.target.x - sim.mouse.x,
    sim.target.y - sim.mouse.y
  );
  return sim.tension * Math.min(1, pull / FULL_STRAIN_PULL);
}

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  pathRef?: (element: SVGPathElement | null, width: number) => void;
}

/** A plastic cable: soft darker edge, body, a shaded underside and a thin highlight */
function CableStroke({ colors, path, pathRef }: CableStrokeProps) {
  return (
    <>
      {CABLE_LAYERS.map((layer) => (
        <path
          key={layer.id}
          ref={(element) => pathRef?.(element, layer.width)}
          d={path}
          fill="none"
          stroke={colors[layer.color]}
          strokeWidth={layer.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={"transform" in layer ? layer.transform : undefined}
          opacity={"opacity" in layer ? layer.opacity : undefined}
          className="transition-[stroke] duration-700"
        />
      ))}
    </>
  );
}

interface CableShadowProps {
  path?: string;
  pathRef?: (element: SVGPathElement | null) => void;
}

/** The cable's shadow on the desk, feathered by stacking strokes */
function CableShadow({ path, pathRef }: CableShadowProps) {
  return (
    <>
      {SHADOW_LAYERS.map((layer) => (
        <path
          key={layer.width}
          ref={pathRef}
          d={path}
          fill="none"
          stroke={SHADOW_COLOR}
          strokeWidth={layer.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={layer.opacity}
          transform={SHADOW_OFFSET}
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
  const shadowRefs = useRef<SVGPathElement[]>([]);
  const cableRefs = useRef<{ element: SVGPathElement; width: number }[]>([]);
  const mouseRef = useRef<SVGGElement>(null);
  const spriteRef = useRef<SVGImageElement>(null);
  /** Each occluder twice: below the mouse [0] and above it [1]; one is hidden */
  const occluderRefs = useRef<(SVGGElement | null)[][]>(
    OFFICE_OCCLUDERS.map(() => [null, null])
  );
  const grabOffset = useRef<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const wakeRef = useRef<() => void>(() => undefined);
  const soundRef = useRef<CableSound | null>(null);
  /** Tension as it's drawn: it follows the simulation's with a little lag */
  const shownTension = useRef(0);
  const shake = useRef({ start: 0, amplitude: 0, x: 0, y: 0 });

  /** The cable stopped the mouse: a thud, and a shudder along the cable */
  const hitStop = useCallback(
    (time: number) => {
      const speed = sim.impact;
      sim.impact = 0;
      if (speed < IMPACT_SPEED || !sim.pull) return;
      soundRef.current?.thud(speed);
      if (prefersReducedMotion()) return;
      const x = sim.pull.x * SCENE_AXES.x.x + sim.pull.y * SCENE_AXES.y.x;
      const y = sim.pull.x * SCENE_AXES.x.y + sim.pull.y * SCENE_AXES.y.y;
      const length = Math.hypot(x, y) || 1;
      shake.current = {
        start: time,
        amplitude: SHAKE.amplitude * Math.min(1, speed / SHAKE.fullSpeed),
        x: x / length,
        y: y / length,
      };
    },
    [sim]
  );

  const render = useCallback(
    (time: number) => {
      const { shadow, cable } = cablePaths(sim);
      shownTension.current +=
        (sim.tension - shownTension.current) * TENSION_SMOOTHING;
      const thinning = 1 - TAUT_THINNING * shownTension.current;
      shadowRefs.current.forEach((path) => path.setAttribute("d", shadow));
      cableRefs.current.forEach(({ element, width }) => {
        element.setAttribute("d", cable);
        element.setAttribute("stroke-width", (width * thinning).toFixed(2));
      });

      const age = time - shake.current.start;
      const shudder =
        shake.current.amplitude *
        Math.exp(-age / SHAKE.decay) *
        Math.cos(age * SHAKE.frequency);
      mouseRef.current?.setAttribute(
        "transform",
        spriteTransform(sim.mouse, {
          x: shake.current.x * shudder,
          y: shake.current.y * shudder,
        })
      );
      const stopped = sim.target !== null && sim.tension >= STOP_TENSION;
      if (spriteRef.current) {
        spriteRef.current.style.cursor = stopped ? "not-allowed" : "";
      }
      OFFICE_OCCLUDERS.forEach((occluder, index) => {
        const front = isInFront(sim.mouse, occluder);
        const [below, above] = occluderRefs.current[index];
        below?.setAttribute("display", front ? "inline" : "none");
        above?.setAttribute("display", front ? "none" : "inline");
      });
    },
    [sim]
  );

  // Fixed-step simulation on requestAnimationFrame that stops once everything is still
  useEffect(() => {
    let frame = 0;
    let running = false;
    let last = 0;
    const tick = (time: number) => {
      advanceCableSim(sim, (time - last) / 1000);
      last = time;
      hitStop(time);
      soundRef.current?.strain(strainOf(sim));
      render(time);
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
    render(performance.now());
    wakeRef.current();
    return () => cancelAnimationFrame(frame);
  }, [render, hitStop, sim]);

  useEffect(
    () => () => {
      soundRef.current?.dispose();
      soundRef.current = null;
    },
    []
  );

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
    // Audio can only start from a gesture: the first grab switches it on
    soundRef.current ??= createCableSound();
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
        <radialGradient id={`${clipPrefix}-mouse-shadow`}>
          <stop offset="0.45" stopColor={SHADOW_COLOR} stopOpacity={0.5} />
          <stop offset="0.75" stopColor={SHADOW_COLOR} stopOpacity={0.22} />
          <stop offset="1" stopColor={SHADOW_COLOR} stopOpacity={0} />
        </radialGradient>
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
      <CableShadow path={KEYBOARD_CABLE_PATH} />
      <CableStroke path={KEYBOARD_CABLE_PATH} colors={colors} />
      {/* Contact shadow: it stays on the desk while the cable's ends rise off it */}
      <CableShadow
        path={initial.shadow}
        pathRef={(element) => {
          if (element && !shadowRefs.current.includes(element)) {
            shadowRefs.current.push(element);
          }
        }}
      />
      <CableStroke
        colors={colors}
        path={initial.cable}
        pathRef={(element, width) => {
          const known = cableRefs.current.some(
            (entry) => entry.element === element
          );
          if (element && !known) cableRefs.current.push({ element, width });
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
        <ellipse
          cx={MOUSE_SHADOW.cx}
          cy={MOUSE_SHADOW.cy}
          rx={MOUSE_SHADOW.rx}
          ry={MOUSE_SHADOW.ry}
          transform={`rotate(${MOUSE_SHADOW.angle} ${MOUSE_SHADOW.cx} ${MOUSE_SHADOW.cy})`}
          fill={`url(#${clipPrefix}-mouse-shadow)`}
        />
        <image
          ref={spriteRef}
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
