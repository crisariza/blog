import { OFFICE_PROJECTION } from "@/lib/office-objects";
import type { Point, Point3 } from "@/types";

/**
 * The scene is drawn in a 2:1 dimetric projection: the desk's length axis runs
 * down-right, its depth axis up-right and up is straight up. Everything that
 * moves is simulated in centimeters on the desk plane and projected here.
 *
 * Desk frame: origin at the desk top's front-right corner, x along the front
 * edge (negative to the left), y towards the back wall, z up.
 */
const { origin, pixelsPerCm, elevation } = OFFICE_PROJECTION;
const HORIZONTAL = Math.SQRT1_2 * pixelsPerCm;
const VERTICAL = Math.SQRT1_2 * Math.sin(elevation) * pixelsPerCm;

/** Scene pixels per centimeter along each desk axis */
export const SCENE_AXES = {
  x: { x: HORIZONTAL, y: VERTICAL },
  y: { x: HORIZONTAL, y: -VERTICAL },
  z: { x: 0, y: -Math.cos(elevation) * pixelsPerCm },
};

export function deskToScene({ x, y, z }: Point3): Point {
  return {
    x: origin.x + (x + y) * HORIZONTAL + z * SCENE_AXES.z.x,
    y: origin.y + (x - y) * VERTICAL + z * SCENE_AXES.z.y,
  };
}

/** Inverse of deskToScene for a point lying on a horizontal plane at height z */
export function sceneToDesk(point: Point, z = 0): Point {
  const sum = (point.x - origin.x) / HORIZONTAL;
  const difference = (point.y - origin.y - z * SCENE_AXES.z.y) / VERTICAL;
  return { x: (sum + difference) / 2, y: (sum - difference) / 2 };
}
