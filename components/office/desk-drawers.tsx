"use client";

import {
  KeyboardEvent,
  PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  advanceDrawerSim,
  allClosed,
  createDrawerSim,
  DrawerState,
  grabDrawer,
  isOpenish,
  releaseDrawer,
  toggleDrawer,
} from "@/lib/office-drawers";
import {
  createDrawerScene,
  DRAWER_VIEWPORT,
  DrawerScene,
} from "@/lib/office-drawer-scene";
import { OFFICE_CABINET, OFFICE_SCENE } from "@/lib/office-objects";
import { deskToScene, SCENE_AXES } from "@/lib/office-projection";
import { DeskDrawersProps, Point } from "@/types";

/** Pointer travel (scene pixels) that turns a click into a drag */
const DRAG_THRESHOLD = 10;
/** How long after the scene shows up three.js gets loaded, so the first pull is instant */
const PRELOAD_DELAY = 600;
/** Scene pixels per centimeter of pulling a drawer out (towards −y on the desk) */
const PULL_AXIS = { x: -SCENE_AXES.y.x, y: -SCENE_AXES.y.y };
const PULL_AXIS_LENGTH_SQUARED = PULL_AXIS.x ** 2 + PULL_AXIS.y ** 2;

const toPercent = (value: number, total: number) => `${(value / total) * 100}%`;

const CANVAS_STYLE = {
  left: toPercent(DRAWER_VIEWPORT.x, OFFICE_SCENE.width),
  top: toPercent(DRAWER_VIEWPORT.y, OFFICE_SCENE.height),
  width: toPercent(DRAWER_VIEWPORT.width, OFFICE_SCENE.width),
  height: toPercent(DRAWER_VIEWPORT.height, OFFICE_SCENE.height),
};

/** Outline of a drawer's front plus the top of whatever is pulled out, to grab it by */
function hitPolygon(drawer: DrawerState) {
  const { frontMinX, frontMaxX } = OFFICE_CABINET;
  const { top, bottom } = drawer.config;
  const front = -drawer.open;
  return [
    { x: frontMinX, y: front, z: bottom },
    { x: frontMaxX, y: front, z: bottom },
    { x: frontMaxX, y: front, z: top },
    { x: frontMaxX, y: 0, z: top },
    { x: frontMinX, y: 0, z: top },
    { x: frontMinX, y: front, z: top },
  ]
    .map(deskToScene)
    .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(" ");
}

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface DragState {
  index: number;
  start: Point;
  startOpen: number;
  dragging: boolean;
}

export default function DeskDrawers({ lampOn }: DeskDrawersProps) {
  // A mutable simulation that lives as long as the component
  const [sim] = useState(createDrawerSim);
  const [openState, setOpenState] = useState(() =>
    sim.drawers.map(() => false)
  );
  const [initialPolygons] = useState(() => sim.drawers.map(hitPolygon));
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const polygonRefs = useRef<(SVGPolygonElement | null)[]>([]);
  const sceneRef = useRef<DrawerScene | null>(null);
  const loadingRef = useRef(false);
  const lampRef = useRef(lampOn);
  const dragRef = useRef<DragState | null>(null);
  const wakeRef = useRef<() => void>(() => undefined);

  const render = useCallback(() => {
    sceneRef.current?.update(sim);
    sim.drawers.forEach((drawer, index) => {
      polygonRefs.current[index]?.setAttribute("points", hitPolygon(drawer));
    });
    // The painted drawers are exact when everything is shut; the 3D only shows otherwise
    const hidden = allClosed(sim) && sim.asleep;
    const canvas = canvasRef.current;
    if (canvas) canvas.style.visibility = hidden ? "hidden" : "visible";
  }, [sim]);

  const loadScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (loadingRef.current || !canvas) return;
    loadingRef.current = true;
    createDrawerScene(canvas)
      .then((scene) => {
        sceneRef.current = scene;
        scene.setLamp(lampRef.current);
        render();
      })
      .catch((error: unknown) => {
        loadingRef.current = false;
        console.error(error);
      });
  }, [render]);

  // Fixed-step simulation on requestAnimationFrame that stops once everything is still
  useEffect(() => {
    let frame = 0;
    let running = false;
    let last = 0;
    const tick = (time: number) => {
      advanceDrawerSim(sim, (time - last) / 1000);
      last = time;
      render();
      if (sim.asleep) {
        running = false;
        setOpenState(sim.drawers.map(isOpenish));
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
    const preload = window.setTimeout(loadScene, PRELOAD_DELAY);
    const canvas = canvasRef.current;
    const observer = new ResizeObserver(() => {
      sceneRef.current?.resize();
      render();
    });
    if (canvas) observer.observe(canvas);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(preload);
      observer.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
      loadingRef.current = false;
    };
  }, [sim, render, loadScene]);

  useEffect(() => {
    lampRef.current = lampOn;
    sceneRef.current?.setLamp(lampOn);
    render();
  }, [lampOn, render]);

  const toScenePoint = (event: PointerEvent) => {
    const matrix = svgRef.current?.getScreenCTM()?.inverse();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix
    );
    return { x: point.x, y: point.y };
  };

  const toggle = (index: number) => {
    loadScene();
    toggleDrawer(sim, index, prefersReducedMotion());
    setOpenState(sim.drawers.map(isOpenish));
    wakeRef.current();
  };

  const handlePointerDown = (
    event: PointerEvent<SVGPolygonElement>,
    index: number
  ) => {
    const start = toScenePoint(event);
    if (!start) return;
    loadScene();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      index,
      start,
      startOpen: sim.drawers[index].open,
      dragging: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<SVGPolygonElement>) => {
    const drag = dragRef.current;
    const point = toScenePoint(event);
    if (!drag || !point) return;
    const dx = point.x - drag.start.x;
    const dy = point.y - drag.start.y;
    if (!drag.dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    drag.dragging = true;
    const pulled =
      (dx * PULL_AXIS.x + dy * PULL_AXIS.y) / PULL_AXIS_LENGTH_SQUARED;
    grabDrawer(sim, drag.index, drag.startOpen + pulled);
    wakeRef.current();
  };

  const handlePointerUp = (event: PointerEvent<SVGPolygonElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (!drag.dragging) {
      toggle(drag.index);
      return;
    }
    releaseDrawer(sim, drag.index);
    wakeRef.current();
  };

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggle(index);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute"
        style={{ ...CANVAS_STYLE, visibility: "hidden" }}
      />
      <svg
        ref={svgRef}
        viewBox={`0 0 ${OFFICE_SCENE.width} ${OFFICE_SCENE.height}`}
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        {sim.drawers.map((drawer, index) => (
          <polygon
            key={drawer.config.id}
            ref={(element) => {
              polygonRefs.current[index] = element;
            }}
            points={initialPolygons[index]}
            role="button"
            tabIndex={0}
            aria-label={`${openState[index] ? "Close" : "Open"} the ${drawer.config.label}`}
            aria-expanded={openState[index]}
            className="pointer-events-auto cursor-pointer touch-none fill-white/0 outline-none transition-[fill] duration-200 focus-visible:fill-white/[0.12]"
            onPointerDown={(event) => handlePointerDown(event, index)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={(event) => handleKeyDown(event, index)}
          />
        ))}
      </svg>
    </>
  );
}
