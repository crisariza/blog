import type { DeskBounds, DeskObstacle, Point } from "@/types";

export interface SurfaceContact {
  /** Signed distance to the surface: negative inside */
  distance: number;
  /** Outward unit normal */
  normal: Point;
}

const length = (x: number, y: number) => Math.hypot(x, y);

function circleContact(
  point: Point,
  center: Point,
  radius: number
): SurfaceContact {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const gap = length(dx, dy);
  if (gap === 0) return { distance: -radius, normal: { x: 0, y: -1 } };
  return { distance: gap - radius, normal: { x: dx / gap, y: dy / gap } };
}

/** Rounded box signed distance, in the box's own (unrotated) frame */
function localBoxContact(
  local: Point,
  halfSize: Point,
  radius: number
): SurfaceContact {
  const qx = Math.abs(local.x) - (halfSize.x - radius);
  const qy = Math.abs(local.y) - (halfSize.y - radius);
  const signX = Math.sign(local.x) || 1;
  const signY = Math.sign(local.y) || 1;
  const outside = length(Math.max(qx, 0), Math.max(qy, 0));

  if (outside > 0) {
    return {
      distance: outside - radius,
      normal: {
        x: (Math.max(qx, 0) / outside) * signX,
        y: (Math.max(qy, 0) / outside) * signY,
      },
    };
  }
  const alongX = qx > qy;
  return {
    distance: Math.max(qx, qy) - radius,
    normal: alongX ? { x: signX, y: 0 } : { x: 0, y: signY },
  };
}

function boxContact(
  point: Point,
  obstacle: Extract<DeskObstacle, { kind: "box" }>
): SurfaceContact {
  const cos = Math.cos(obstacle.angle);
  const sin = Math.sin(obstacle.angle);
  const dx = point.x - obstacle.center.x;
  const dy = point.y - obstacle.center.y;
  const local = { x: dx * cos + dy * sin, y: -dx * sin + dy * cos };
  const { distance, normal } = localBoxContact(
    local,
    obstacle.halfSize,
    obstacle.radius
  );
  return {
    distance,
    normal: {
      x: normal.x * cos - normal.y * sin,
      y: normal.x * sin + normal.y * cos,
    },
  };
}

export function obstacleContact(
  point: Point,
  obstacle: DeskObstacle
): SurfaceContact {
  if (obstacle.kind === "circle") {
    return circleContact(point, obstacle.center, obstacle.radius);
  }
  return boxContact(point, obstacle);
}

/**
 * The deepest contact of a disc against the obstacles, or null if it's free.
 * Resolving the deepest one first and repeating converges without the jitter
 * of pushing out of each obstacle in turn.
 */
export function deepestContact(
  point: Point,
  radius: number,
  obstacles: DeskObstacle[]
): SurfaceContact | null {
  let deepest: SurfaceContact | null = null;
  for (const obstacle of obstacles) {
    const contact = obstacleContact(point, obstacle);
    const depth = contact.distance - radius;
    if (depth >= 0) continue;
    if (deepest && depth >= deepest.distance) continue;
    deepest = { distance: depth, normal: contact.normal };
  }
  return deepest;
}

/** How far a disc pokes out of the bounds, as a push back inside (zero if inside) */
export function boundsCorrection(
  point: Point,
  radius: number,
  bounds: DeskBounds
): Point {
  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));
  return {
    x: clamp(point.x, bounds.minX + radius, bounds.maxX - radius) - point.x,
    y: clamp(point.y, bounds.minY + radius, bounds.maxY - radius) - point.y,
  };
}

/** Smooth SVG path through points (Catmull-Rom converted to cubic Béziers) */
export function smoothPath(points: Point[]) {
  if (points.length < 2) return "";
  const parts = [`M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`];
  for (let index = 0; index < points.length - 1; index++) {
    const p0 = points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[Math.min(points.length - 1, index + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    parts.push(
      `C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
    );
  }
  return parts.join(" ");
}
