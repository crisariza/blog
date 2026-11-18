import { Ellipse, Point } from "@/types";

export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y);

/** Ray casting point-in-polygon test */
export function isInsidePolygon(point: Point, polygon: Point[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    const crosses =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function closestPointOnSegment(point: Point, a: Point, b: Point): Point {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return a;
  const t = Math.max(
    0,
    Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared)
  );
  return { x: a.x + t * dx, y: a.y + t * dy };
}

/** Keeps a point inside the polygon by snapping it to the nearest edge */
export function clampToPolygon(point: Point, polygon: Point[]): Point {
  if (isInsidePolygon(point, polygon)) return point;

  let closest = polygon[0];
  let closestDistance = Infinity;
  polygon.forEach((vertex, index) => {
    const candidate = closestPointOnSegment(
      point,
      vertex,
      polygon[(index + 1) % polygon.length]
    );
    const candidateDistance = distance(point, candidate);
    if (candidateDistance >= closestDistance) return;
    closest = candidate;
    closestDistance = candidateDistance;
  });
  return closest;
}

/**
 * Pushes a point out of elliptical obstacles. Ellipses match the isometric
 * footprint of round or square desk objects better than circles.
 */
export function pushOutOfEllipses(point: Point, ellipses: Ellipse[]): Point {
  return ellipses.reduce((current, { center, radiusX, radiusY }) => {
    const dx = (current.x - center.x) / radiusX;
    const dy = (current.y - center.y) / radiusY;
    const normalized = Math.hypot(dx, dy);
    if (normalized >= 1) return current;
    if (normalized === 0) return { x: center.x, y: center.y + radiusY };
    return {
      x: center.x + (dx / normalized) * radiusX,
      y: center.y + (dy / normalized) * radiusY,
    };
  }, point);
}

const quadraticPoint = (
  start: Point,
  control: Point,
  end: Point,
  t: number
): Point => {
  const inverse = 1 - t;
  return {
    x:
      inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
    y:
      inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
  };
};

const CABLE_SAMPLES = 28;
const CABLE_RELAX_PASSES = 6;

/**
 * Samples the cable curve and relaxes it around desk objects, so it lies on
 * the desk and wraps around them instead of crossing over.
 */
export function routeCable(
  start: Point,
  control: Point,
  end: Point,
  obstacles: Ellipse[]
): Point[] {
  const steps = [...Array(CABLE_SAMPLES + 1).keys()];
  let points = steps.map((step) =>
    quadraticPoint(start, control, end, step / CABLE_SAMPLES)
  );

  for (let pass = 0; pass < CABLE_RELAX_PASSES; pass++) {
    points = points.map((point, index) => {
      if (index === 0 || index === points.length - 1) return point;
      const previous = points[index - 1];
      const next = points[index + 1];
      const smoothed = {
        x: point.x * 0.5 + (previous.x + next.x) * 0.25,
        y: point.y * 0.5 + (previous.y + next.y) * 0.25,
      };
      return pushOutOfEllipses(smoothed, obstacles);
    });
  }
  return points;
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

/** Limits how far a point can be from an anchor; reports whether it hit the limit */
export function limitDistance(
  anchor: Point,
  point: Point,
  maxDistance: number
) {
  const gap = distance(anchor, point);
  if (gap <= maxDistance) return { point, atLimit: false };
  const scale = maxDistance / gap;
  return {
    point: {
      x: anchor.x + (point.x - anchor.x) * scale,
      y: anchor.y + (point.y - anchor.y) * scale,
    },
    atLimit: true,
  };
}

/**
 * Control point for a cable drawn as a quadratic curve: the more slack, the more it bows
 * towards the front of the desk.
 */
export function cableControlPoint(
  anchor: Point,
  end: Point,
  length: number,
  wobble: number
): Point {
  const gap = distance(anchor, end);
  const slack = Math.sqrt(Math.max(0, length * length - gap * gap)) * 0.45;
  const middle = { x: (anchor.x + end.x) / 2, y: (anchor.y + end.y) / 2 };
  if (gap === 0) return { x: middle.x, y: middle.y + slack };

  // Perpendicular that points down/forward in the isometric view
  let normal = { x: -(end.y - anchor.y) / gap, y: (end.x - anchor.x) / gap };
  if (normal.y < 0) normal = { x: -normal.x, y: -normal.y };

  const bow = slack + wobble;
  return { x: middle.x + normal.x * bow, y: middle.y + normal.y * bow };
}
