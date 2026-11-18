import { Point } from "@/types";

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

/** Pushes a point out of circular obstacles (desk objects the mouse can't pass through) */
export function pushOutOfCircles(
  point: Point,
  circles: { center: Point; radius: number }[]
): Point {
  return circles.reduce((current, { center, radius }) => {
    const gap = distance(current, center);
    if (gap >= radius || gap === 0) return current;
    const scale = radius / gap;
    return {
      x: center.x + (current.x - center.x) * scale,
      y: center.y + (current.y - center.y) * scale,
    };
  }, point);
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
