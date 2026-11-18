import { OFFICE_CABLE, OFFICE_DESK, OFFICE_MOUSE } from "@/lib/office-objects";
import { boundsCorrection, deepestContact } from "@/lib/office-physics";
import type { Point, Point3 } from "@/types";

/**
 * The mouse and its cable, simulated on the desk plane in centimeters and
 * seconds with extended position-based dynamics (XPBD) in small substeps.
 *
 * - The cable is a chain of particles with inextensible links, bending
 *   stiffness with a little plastic memory, and Coulomb friction against the
 *   desk, so it stays wherever it was left and gets dragged from the end.
 * - It's pinned at the grommet and at the mouse, leaves the mouse straight out
 *   of its back, and can't stretch: once it's taut it holds the mouse back,
 *   and its small elastic give pulls the mouse back a touch when released.
 * - The mouse follows the hand through a stiff spring, slides a little on its
 *   feet when let go and slides along whatever it bumps into.
 */

const STEP = 1 / 120;
const SUBSTEPS = 10;
const SUBSTEP = STEP / SUBSTEPS;
/** Longest stretch of time simulated per frame, so a hidden tab doesn't explode */
const MAX_FRAME_TIME = 4 * STEP;
const GRAVITY = 981;

const CABLE_STATIC_FRICTION = 0.6;
const CABLE_KINETIC_FRICTION = 0.45;
/** Air drag and internal damping of the cable, per second */
const CABLE_DAMPING = 4;
/** Fastest the cable keeps moving on its own, in cm/s */
const MAX_CABLE_SPEED = 90;
/** XPBD compliances (inverse stiffness) */
const LINK_COMPLIANCE = 1e-8;
const BEND_COMPLIANCE = 2e-5;
const STRAIN_RELIEF_COMPLIANCE = 4e-6;
/** How fast a bend becomes the cable's new resting shape, per second */
const PLASTIC_RATE = 0.35;

/** PTFE mouse feet on wood */
const MOUSE_FRICTION = 0.22;
const MOUSE_STATIC_FRICTION = 0.3;
/** How tightly the mouse follows the hand (angular frequency of a critically damped spring) */
const DRAG_FREQUENCY = 38;
/** Hardest a hand pushes a mouse around, in cm/s² */
const MAX_DRAG_ACCELERATION = 2600;
const MOUSE_RESTITUTION = 0.25;
/** Below this impact speed (cm/s) the mouse just stops instead of bouncing */
const BOUNCE_SPEED = 12;

/** How much a taut cable stretches before it stops the mouse dead (fraction of its length) */
const MAX_STRETCH = 0.02;
/** Most the hard stop moves the mouse per substep (cm), so a kinked cable can't fling it */
const MAX_STOP_CORRECTION = 0.2;
/** Pull of a stretched cable on the mouse, in cm/s² per cm of stretch */
const CABLE_ELASTICITY = 1800;
/** Internal damping of that stretch (critical for the elasticity), per second */
const CABLE_STRETCH_DAMPING = 85;

/** Below this (cm/s, a fraction of a pixel per second) the scene counts as still */
const SLEEP_SPEED = 0.3;
const SLEEP_FRAMES = 45;

const {
  anchor,
  length: CABLE_LENGTH,
  segments,
  radius: CABLE_RADIUS,
} = OFFICE_CABLE;
const { cableExit, bodyRadius, bodyHalfLength } = OFFICE_MOUSE;
const COUNT = segments + 1;
const LAST = COUNT - 1;
const SEGMENT = CABLE_LENGTH / segments;
const MAX_STRETCH_LENGTH = CABLE_LENGTH * MAX_STRETCH;
/** Furthest a particle coasts in a substep (cm) */
const MAX_COAST = MAX_CABLE_SPEED * SUBSTEP;
const BODY_OFFSETS = [-bodyHalfLength, 0, bodyHalfLength];
/** Directions the cable leaves the grommet and comes into the mouse in its first layout */
const LAYOUT_START_DIRECTION = { x: 0.95, y: -0.3 };
const LAYOUT_END_DIRECTION = { x: 0.55, y: 0.85 };
/** Particles this close to a desk object (cm) count as resting against it */
const CONTACT_MARGIN = 0.15;
/** Particles next to the mouse ride on its strain relief and don't collide with it */
const MOUSE_SKIP = 4;
/**
 * Share of its overlap with the mouse a particle is pushed out by per substep:
 * the mouse nudges the cable aside, but can't stretch it by squeezing it
 */
const MOUSE_PUSH = 0.15;

export interface CableSim {
  x: Float64Array;
  y: Float64Array;
  previousX: Float64Array;
  previousY: Float64Array;
  /** Resting sideways offset of each particle from its neighbors' midpoint */
  restBend: Float64Array;
  /** Particles pressed against a desk object: the corners a taut cable pivots on */
  touching: Uint8Array;
  mouse: Point;
  mouseVelocity: Point;
  /** Where the hand wants the mouse, while it's being dragged */
  target: Point | null;
  /** How much longer than the cable its chain of links is (cm) */
  stretch: number;
  /** How much longer than the cable its tightest path is; negative while there's slack (cm) */
  slack: number;
  /** How stretched the cable is: 0 slack, 1 at the hard stop */
  tension: number;
  /** Direction (unit) a taut cable pulls the mouse in, or null while it's slack */
  pull: Point | null;
  /** Hardest the mouse hit the cable's stop since it was last read, in cm/s */
  impact: number;
  accumulator: number;
  quietFrames: number;
  asleep: boolean;
}

const exitOf = (mouse: Point): Point => ({
  x: mouse.x + cableExit.x,
  y: mouse.y + cableExit.y,
});

const cubic = (points: Point[], t: number): Point => {
  const u = 1 - t;
  const weights = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return {
    x: points.reduce((sum, point, index) => sum + point.x * weights[index], 0),
    y: points.reduce((sum, point, index) => sum + point.y * weights[index], 0),
  };
};

/**
 * The cable as it lies at first: out of the grommet towards the right, then
 * swinging round into the back of the mouse, like the cable in the scene.
 * `reach` sets how far the curve swings out.
 */
function sampleCurve(start: Point, end: Point, reach: number) {
  const controls = [
    start,
    {
      x: start.x + LAYOUT_START_DIRECTION.x * reach,
      y: start.y + LAYOUT_START_DIRECTION.y * reach,
    },
    {
      x: end.x + LAYOUT_END_DIRECTION.x * reach,
      y: end.y + LAYOUT_END_DIRECTION.y * reach,
    },
    end,
  ];
  const samples = [...Array(241).keys()].map((index) =>
    cubic(controls, index / 240)
  );
  const lengths = samples.map((point, index) =>
    index === 0
      ? 0
      : Math.hypot(
          point.x - samples[index - 1].x,
          point.y - samples[index - 1].y
        )
  );
  return {
    samples,
    total: lengths.reduce((sum, value) => sum + value, 0),
    lengths,
  };
}

/** Points spaced exactly one segment apart along the curve */
function resample(samples: Point[], lengths: number[]): Point[] {
  const points: Point[] = [samples[0]];
  let travelled = 0;
  let next = SEGMENT;
  for (
    let index = 1;
    index < samples.length && points.length < COUNT;
    index++
  ) {
    const piece = lengths[index];
    while (travelled + piece >= next && points.length < COUNT) {
      const t = (next - travelled) / piece;
      const a = samples[index - 1];
      const b = samples[index];
      points.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      next += SEGMENT;
    }
    travelled += piece;
  }
  while (points.length < COUNT) points.push(samples[samples.length - 1]);
  return points;
}

/** Lays the cable out as a smooth curve of exactly its length between both ends */
function layoutCable(start: Point, end: Point): Point[] {
  let low = 0;
  let high = CABLE_LENGTH;
  for (let iteration = 0; iteration < 40; iteration++) {
    const bow = (low + high) / 2;
    if (sampleCurve(start, end, bow).total > CABLE_LENGTH) high = bow;
    else low = bow;
  }
  const { samples, lengths } = sampleCurve(start, end, low);
  return resample(samples, lengths);
}

/** Sideways offset of particle i from the midpoint of its neighbors, in their frame */
function bendOffset(sim: CableSim, index: number) {
  const ax = sim.x[index - 1];
  const ay = sim.y[index - 1];
  const tx = sim.x[index + 1] - ax;
  const ty = sim.y[index + 1] - ay;
  const span = Math.hypot(tx, ty) || 1;
  const normal = { x: -ty / span, y: tx / span };
  const offset =
    (sim.x[index] - (ax + sim.x[index + 1]) / 2) * normal.x +
    (sim.y[index] - (ay + sim.y[index + 1]) / 2) * normal.y;
  return { offset, normal };
}

/** The recorded resting layout when the mouse is at its starting spot, else a fresh curve */
function initialLayout(mouse: Point): Point[] {
  const { restingLayout } = OFFICE_CABLE;
  const atStart =
    mouse.x === OFFICE_MOUSE.start.x && mouse.y === OFFICE_MOUSE.start.y;
  if (atStart && restingLayout.length === COUNT) {
    return restingLayout.map(([x, y]) => ({ x, y }));
  }
  return layoutCable(anchor, exitOf(mouse));
}

export function createCableSim(mouse: Point = OFFICE_MOUSE.start): CableSim {
  const points = initialLayout(mouse);
  const sim: CableSim = {
    x: Float64Array.from(points, (point) => point.x),
    y: Float64Array.from(points, (point) => point.y),
    previousX: Float64Array.from(points, (point) => point.x),
    previousY: Float64Array.from(points, (point) => point.y),
    restBend: new Float64Array(COUNT),
    touching: new Uint8Array(COUNT),
    mouse: { ...mouse },
    mouseVelocity: { x: 0, y: 0 },
    target: null,
    stretch: 0,
    slack: 0,
    tension: 0,
    pull: null,
    impact: 0,
    accumulator: 0,
    quietFrames: 0,
    asleep: false,
  };
  relaxLayout(sim);
  for (let index = 1; index < LAST; index++) {
    sim.restBend[index] = bendOffset(sim, index).offset;
  }
  return sim;
}

/** Untangles the initial arc from the desk objects without giving it any speed */
function relaxLayout(sim: CableSim) {
  for (let pass = 0; pass < 200; pass++) {
    solveLinks(sim);
    solveTethers(sim);
    collideCable(sim);
    sim.previousX.set(sim.x);
    sim.previousY.set(sim.y);
  }
}

/* Mouse */

function driveMouse(sim: CableSim) {
  const { mouse, mouseVelocity: velocity, target } = sim;
  if (!target) {
    applyMouseFriction(velocity);
    return;
  }
  let ax =
    DRAG_FREQUENCY ** 2 * (target.x - mouse.x) -
    2 * DRAG_FREQUENCY * velocity.x;
  let ay =
    DRAG_FREQUENCY ** 2 * (target.y - mouse.y) -
    2 * DRAG_FREQUENCY * velocity.y;
  const magnitude = Math.hypot(ax, ay);
  if (magnitude > MAX_DRAG_ACCELERATION) {
    ax *= MAX_DRAG_ACCELERATION / magnitude;
    ay *= MAX_DRAG_ACCELERATION / magnitude;
  }
  // The tighter the cable, the more of the push against it it takes: all of it at its stop
  const outward = sim.pull ? -(ax * sim.pull.x + ay * sim.pull.y) : 0;
  if (sim.pull && outward > 0) {
    ax += sim.pull.x * outward * sim.tension;
    ay += sim.pull.y * outward * sim.tension;
  }
  velocity.x += ax * SUBSTEP;
  velocity.y += ay * SUBSTEP;
}

function applyMouseFriction(velocity: Point) {
  const speed = Math.hypot(velocity.x, velocity.y);
  const loss = MOUSE_FRICTION * GRAVITY * SUBSTEP;
  if (speed <= loss) {
    velocity.x = 0;
    velocity.y = 0;
    return;
  }
  velocity.x *= 1 - loss / speed;
  velocity.y *= 1 - loss / speed;
}

/** How much longer than the cable its chain of links is: they only stretch when it's caught */
function chainStretch(sim: CableSim) {
  let length = 0;
  for (let index = 1; index < COUNT; index++) {
    length += Math.hypot(
      sim.x[index] - sim.x[index - 1],
      sim.y[index] - sim.y[index - 1]
    );
  }
  return length - CABLE_LENGTH;
}

/**
 * The shortest path the cable could be pulled into: from the grommet, around
 * the corners it rests against, to the mouse. When that path is longer than
 * the cable, the cable is taut and stretched by the difference; otherwise any
 * slack can still be pulled through, however the links lag behind.
 */
function tautPath(sim: CableSim) {
  const exit = exitOf(sim.mouse);
  let length = 0;
  let pivot: Point = anchor;
  for (let index = 1; index < LAST - MOUSE_SKIP; index++) {
    if (!sim.touching[index]) continue;
    const corner = { x: sim.x[index], y: sim.y[index] };
    length += Math.hypot(corner.x - pivot.x, corner.y - pivot.y);
    pivot = corner;
  }
  const dx = pivot.x - exit.x;
  const dy = pivot.y - exit.y;
  const last = Math.hypot(dx, dy) || 1;
  return {
    excess: length + last - CABLE_LENGTH,
    toward: { x: dx / last, y: dy / last },
  };
}

/**
 * A taut cable stretches a little and pulls the mouse back (damped, so the
 * recoil doesn't ring); past its maximum stretch it stops the mouse outright:
 * the mouse can still slide sideways or come back, never go further.
 */
function applyCableTension(sim: CableSim) {
  const { excess, toward } = tautPath(sim);
  sim.slack = excess;
  sim.pull = excess > 0 ? toward : null;
  if (excess <= 0) return;

  const { mouse, mouseVelocity: velocity } = sim;
  const away = -(velocity.x * toward.x + velocity.y * toward.y);
  const pull = CABLE_ELASTICITY * excess + CABLE_STRETCH_DAMPING * away;
  const resting = !sim.target && Math.hypot(velocity.x, velocity.y) === 0;
  // A mouse at rest stays put until the cable pulls harder than its feet grip
  if (resting && pull < MOUSE_STATIC_FRICTION * GRAVITY) return;
  velocity.x += toward.x * pull * SUBSTEP;
  velocity.y += toward.y * pull * SUBSTEP;

  const overshoot = Math.min(excess - MAX_STRETCH_LENGTH, MAX_STOP_CORRECTION);
  if (overshoot <= 0) return;
  mouse.x += toward.x * overshoot;
  mouse.y += toward.y * overshoot;
  const stillAway = -(velocity.x * toward.x + velocity.y * toward.y);
  if (stillAway <= 0) return;
  sim.impact = Math.max(sim.impact, stillAway);
  velocity.x += toward.x * stillAway;
  velocity.y += toward.y * stillAway;
}

/** What's left of a vector once its part going against `along` is taken out, and `sideways` of the rest */
function restrain(vector: Point, along: Point, sideways: number) {
  const forward = vector.x * along.x + vector.y * along.y;
  const sideX = vector.x - along.x * forward;
  const sideY = vector.y - along.y * forward;
  const kept = Math.max(forward, 0);
  return {
    x: along.x * kept + sideX * sideways,
    y: along.y * kept + sideY * sideways,
  };
}

/**
 * A cable caught on something can't be pulled any further: once its links are
 * stretched past their give, whatever part of the mouse's move went away from
 * the cable is undone, and the more it's stretched the less the mouse can
 * swing sideways too. It can always come back along the cable, but never
 * drags it through whatever holds it.
 */
function holdSnaggedMouse(sim: CableSim, before: Point) {
  const stretch = chainStretch(sim);
  sim.stretch = stretch;
  const excess = Math.max(sim.slack, stretch);
  sim.tension = Math.min(1, Math.max(0, excess / MAX_STRETCH_LENGTH));
  if (stretch <= MAX_STRETCH_LENGTH) return;

  const { mouse, mouseVelocity: velocity } = sim;
  const exit = exitOf(mouse);
  const dx = sim.x[LAST - MOUSE_SKIP] - exit.x;
  const dy = sim.y[LAST - MOUSE_SKIP] - exit.y;
  const reach = Math.hypot(dx, dy) || 1;
  const along = { x: dx / reach, y: dy / reach };
  const sideways = Math.max(0, 2 - stretch / MAX_STRETCH_LENGTH);

  const move = restrain(
    { x: mouse.x - before.x, y: mouse.y - before.y },
    along,
    sideways
  );
  mouse.x = before.x + move.x;
  mouse.y = before.y + move.y;
  const away = -(velocity.x * along.x + velocity.y * along.y);
  if (away > 0) sim.impact = Math.max(sim.impact, away);
  Object.assign(velocity, restrain(velocity, along, sideways));
}

/** Deepest overlap of the mouse's footprint with the desk objects or the desk's edges */
function mouseContact(mouse: Point) {
  let deepest: { depth: number; normal: Point } | null = null;
  // The cable's plug sticks out of the mouse's back: it bumps into things too
  const plug = deepestContact(
    exitOf(mouse),
    CABLE_RADIUS,
    OFFICE_DESK.obstacles
  );
  if (plug) deepest = { depth: plug.distance, normal: plug.normal };
  for (const offset of BODY_OFFSETS) {
    const disc = { x: mouse.x, y: mouse.y + offset };
    const contact = deepestContact(disc, bodyRadius, OFFICE_DESK.obstacles);
    if (contact && (!deepest || contact.distance < deepest.depth)) {
      deepest = { depth: contact.distance, normal: contact.normal };
    }
    const push = boundsCorrection(disc, bodyRadius, {
      ...OFFICE_MOUSE.bounds,
      minY: OFFICE_MOUSE.bounds.minY - offset,
      maxY: OFFICE_MOUSE.bounds.maxY - offset,
    });
    const depth = -Math.hypot(push.x, push.y);
    if (depth < 0 && (!deepest || depth < deepest.depth)) {
      deepest = { depth, normal: { x: push.x / -depth, y: push.y / -depth } };
    }
  }
  return deepest;
}

/** Slides the mouse out of whatever it ran into, bouncing a little on hard hits */
function collideMouse(sim: CableSim) {
  const { mouse, mouseVelocity: velocity } = sim;
  for (let pass = 0; pass < 4; pass++) {
    const contact = mouseContact(mouse);
    if (!contact) return;
    mouse.x -= contact.normal.x * contact.depth;
    mouse.y -= contact.normal.y * contact.depth;
    const approach =
      velocity.x * contact.normal.x + velocity.y * contact.normal.y;
    if (approach >= 0) continue;
    const bounce = -approach > BOUNCE_SPEED ? MOUSE_RESTITUTION : 0;
    velocity.x -= (1 + bounce) * approach * contact.normal.x;
    velocity.y -= (1 + bounce) * approach * contact.normal.y;
  }
}

function moveMouse(sim: CableSim) {
  driveMouse(sim);
  sim.mouse.x += sim.mouseVelocity.x * SUBSTEP;
  sim.mouse.y += sim.mouseVelocity.y * SUBSTEP;
  collideMouse(sim);
}

/* Cable */

function integrateCable(sim: CableSim) {
  const keep = 1 - CABLE_DAMPING * SUBSTEP;
  for (let index = 1; index < LAST; index++) {
    const vx = (sim.x[index] - sim.previousX[index]) * keep;
    const vy = (sim.y[index] - sim.previousY[index]) * keep;
    // A cable lying on a desk doesn't whip: what the solver snapped it into
    // place by doesn't carry on as speed
    const limit = Math.min(1, MAX_COAST / (Math.hypot(vx, vy) || 1));
    sim.previousX[index] = sim.x[index];
    sim.previousY[index] = sim.y[index];
    sim.x[index] += vx * limit;
    sim.y[index] += vy * limit;
  }
  const exit = exitOf(sim.mouse);
  sim.previousX[LAST] = sim.x[LAST];
  sim.previousY[LAST] = sim.y[LAST];
  sim.x[LAST] = exit.x;
  sim.y[LAST] = exit.y;
  sim.x[0] = anchor.x;
  sim.y[0] = anchor.y;
}

/** Inverse mass: both ends are pinned */
const weight = (index: number) => (index === 0 || index === LAST ? 0 : 1);

function solveLink(sim: CableSim, index: number, alpha: number) {
  const next = index + 1;
  const wa = weight(index);
  const wb = weight(next);
  const dx = sim.x[next] - sim.x[index];
  const dy = sim.y[next] - sim.y[index];
  const gap = Math.hypot(dx, dy);
  if (gap === 0 || wa + wb === 0) return;
  const lambda = -(gap - SEGMENT) / (wa + wb + alpha);
  const nx = dx / gap;
  const ny = dy / gap;
  sim.x[index] -= wa * lambda * nx;
  sim.y[index] -= wa * lambda * ny;
  sim.x[next] += wb * lambda * nx;
  sim.y[next] += wb * lambda * ny;
}

/** One sweep each way, so a pull travels the whole cable within a substep */
function solveLinks(sim: CableSim) {
  const alpha = LINK_COMPLIANCE / SUBSTEP ** 2;
  for (let index = 0; index < LAST; index++) solveLink(sim, index, alpha);
  for (let index = LAST - 1; index >= 0; index--) solveLink(sim, index, alpha);
}

function solveBend(sim: CableSim, index: number, alpha: number) {
  const { offset, normal } = bendOffset(sim, index);
  const wa = weight(index - 1);
  const wb = weight(index);
  const wc = weight(index + 1);
  const error = offset - sim.restBend[index];
  const lambda = -error / (wb + (wa + wc) / 4 + alpha);
  sim.x[index] += wb * lambda * normal.x;
  sim.y[index] += wb * lambda * normal.y;
  sim.x[index - 1] -= (wa * lambda * normal.x) / 2;
  sim.y[index - 1] -= (wa * lambda * normal.y) / 2;
  sim.x[index + 1] -= (wc * lambda * normal.x) / 2;
  sim.y[index + 1] -= (wc * lambda * normal.y) / 2;
  sim.restBend[index] += error * PLASTIC_RATE * SUBSTEP;
}

function solveBending(sim: CableSim) {
  const alpha = BEND_COMPLIANCE / SUBSTEP ** 2;
  for (let index = 1; index < LAST; index++) solveBend(sim, index, alpha);
}

/**
 * The cable leaves the mouse straight out of its back before it bends. The
 * rubber boot gives way as the cable tightens: a taut cable pulls it round
 * to wherever it's being pulled from.
 */
function solveStrainRelief(sim: CableSim) {
  const alpha = STRAIN_RELIEF_COMPLIANCE / SUBSTEP ** 2;
  const index = LAST - 1;
  const targetX = sim.x[LAST];
  const targetY = sim.y[LAST] + SEGMENT;
  const factor = (1 - sim.tension) ** 2 / (1 + alpha);
  sim.x[index] += (targetX - sim.x[index]) * factor;
  sim.y[index] += (targetY - sim.y[index]) * factor;
}

/** Long-range attachments: no particle gets further from the grommet than the cable allows */
function solveTethers(sim: CableSim) {
  for (let index = 1; index < LAST; index++) {
    const dx = sim.x[index] - anchor.x;
    const dy = sim.y[index] - anchor.y;
    const gap = Math.hypot(dx, dy);
    const reach = index * SEGMENT;
    if (gap <= reach) continue;
    sim.x[index] = anchor.x + (dx / gap) * reach;
    sim.y[index] = anchor.y + (dy / gap) * reach;
  }
}

function collideParticle(sim: CableSim, index: number) {
  const point = { x: sim.x[index], y: sim.y[index] };
  const contact = deepestContact(
    point,
    CABLE_RADIUS + CONTACT_MARGIN,
    OFFICE_DESK.obstacles
  );
  sim.touching[index] = contact ? 1 : 0;
  const depth = contact ? contact.distance + CONTACT_MARGIN : 0;
  if (contact && depth < 0) {
    point.x -= contact.normal.x * depth;
    point.y -= contact.normal.y * depth;
  }
  const push = boundsCorrection(point, CABLE_RADIUS, OFFICE_DESK.bounds);
  // A cable pinned against something has nowhere to go: the mouse rides over it
  const pinned = contact !== null || push.x !== 0 || push.y !== 0;
  if (index < LAST - MOUSE_SKIP && !pinned) pushOutOfMouse(point, sim.mouse);
  // Contacts stop the cable rather than fling it: the push carries no velocity
  sim.previousX[index] += point.x + push.x - sim.x[index];
  sim.previousY[index] += point.y + push.y - sim.y[index];
  sim.x[index] = point.x + push.x;
  sim.y[index] = point.y + push.y;
}

function pushOutOfMouse(point: Point, mouse: Point) {
  const reach = bodyRadius + CABLE_RADIUS;
  for (const offset of BODY_OFFSETS) {
    const dx = point.x - mouse.x;
    const dy = point.y - (mouse.y + offset);
    const gap = Math.hypot(dx, dy);
    if (gap >= reach || gap === 0) continue;
    point.x += (dx / gap) * (reach - gap) * MOUSE_PUSH;
    point.y += (dy / gap) * (reach - gap) * MOUSE_PUSH;
  }
}

/** Points along each link that are checked too, so links slide over corners instead of cutting them */
const LINK_SAMPLES = [0.25, 0.5, 0.75];

/** Pushes a link out of a desk object at the point t along it, moving both ends */
function collideLinkAt(sim: CableSim, index: number, t: number) {
  const next = index + 1;
  const point = {
    x: sim.x[index] + (sim.x[next] - sim.x[index]) * t,
    y: sim.y[index] + (sim.y[next] - sim.y[index]) * t,
  };
  const contact = deepestContact(point, CABLE_RADIUS, OFFICE_DESK.obstacles);
  if (!contact) return;
  const wa = weight(index) * (1 - t);
  const wb = weight(next) * t;
  const share = wa * (1 - t) + wb * t;
  if (share === 0) return;
  const push = -contact.distance / share;
  const moves: [number, number][] = [
    [index, wa * push],
    [next, wb * push],
  ];
  for (const [particle, amount] of moves) {
    sim.x[particle] += contact.normal.x * amount;
    sim.y[particle] += contact.normal.y * amount;
    sim.previousX[particle] += contact.normal.x * amount;
    sim.previousY[particle] += contact.normal.y * amount;
  }
}

function collideCable(sim: CableSim) {
  for (let index = 0; index < LAST; index++) {
    for (const t of LINK_SAMPLES) collideLinkAt(sim, index, t);
  }
  for (let index = 1; index < LAST; index++) collideParticle(sim, index);
}

/** Coulomb friction with the desk: slow parts stick, moving parts lose speed */
function applyCableFriction(sim: CableSim) {
  const stick = CABLE_STATIC_FRICTION * GRAVITY * SUBSTEP ** 2;
  const slide = CABLE_KINETIC_FRICTION * GRAVITY * SUBSTEP ** 2;
  for (let index = 1; index < LAST; index++) {
    const dx = sim.x[index] - sim.previousX[index];
    const dy = sim.y[index] - sim.previousY[index];
    const moved = Math.hypot(dx, dy);
    if (moved <= stick) {
      sim.x[index] = sim.previousX[index];
      sim.y[index] = sim.previousY[index];
      continue;
    }
    sim.x[index] -= (dx / moved) * Math.min(slide, moved);
    sim.y[index] -= (dy / moved) * Math.min(slide, moved);
  }
}

function substep(sim: CableSim) {
  const before = { ...sim.mouse };
  moveMouse(sim);
  integrateCable(sim);
  // Friction first: it only slows the cable's own motion, so the links below
  // always win and a slow pull can't stretch the cable until it snaps free
  applyCableFriction(sim);
  solveLinks(sim);
  solveBending(sim);
  solveStrainRelief(sim);
  solveTethers(sim);
  collideCable(sim);
  applyCableTension(sim);
  holdSnaggedMouse(sim, before);
  collideMouse(sim);
  const exit = exitOf(sim.mouse);
  sim.x[LAST] = exit.x;
  sim.y[LAST] = exit.y;
}

/** Positions of the mouse and every particle, to measure how much a step moved them */
function snapshot(sim: CableSim) {
  const positions = new Float64Array(COUNT * 2 + 2);
  for (let index = 0; index < COUNT; index++) {
    positions[index * 2] = sim.x[index];
    positions[index * 2 + 1] = sim.y[index];
  }
  positions[COUNT * 2] = sim.mouse.x;
  positions[COUNT * 2 + 1] = sim.mouse.y;
  return positions;
}

/** Fastest-moving part of the system over the last step, in cm/s */
function peakSpeed(before: Float64Array, after: Float64Array) {
  let peak = 0;
  for (let index = 0; index < before.length; index += 2) {
    const moved = Math.hypot(
      after[index] - before[index],
      after[index + 1] - before[index + 1]
    );
    peak = Math.max(peak, moved / STEP);
  }
  return peak;
}

function step(sim: CableSim) {
  const before = snapshot(sim);
  for (let index = 0; index < SUBSTEPS; index++) substep(sim);
  const quiet = !sim.target && peakSpeed(before, snapshot(sim)) < SLEEP_SPEED;
  sim.quietFrames = quiet ? sim.quietFrames + 1 : 0;
  sim.asleep = sim.quietFrames > SLEEP_FRAMES;
}

/** Advances the simulation by the time since the last frame, in fixed steps */
export function advanceCableSim(sim: CableSim, elapsedSeconds: number) {
  if (sim.asleep) return;
  sim.accumulator += Math.min(elapsedSeconds, MAX_FRAME_TIME);
  while (sim.accumulator >= STEP) {
    step(sim);
    sim.accumulator -= STEP;
  }
}

/** Runs the simulation without rendering, to let a fresh layout settle */
export function settleCableSim(sim: CableSim, seconds: number) {
  for (let elapsed = 0; elapsed < seconds; elapsed += STEP) step(sim);
}

export function setMouseTarget(sim: CableSim, target: Point | null) {
  sim.target = target;
  sim.asleep = false;
  sim.quietFrames = 0;
}

/** Height (cm) the cable rises to at each end: out of the grommet and up into the mouse */
const GROMMET_LIFT = [-0.6, 1.1, 0.7, 0.3];
const MOUSE_LIFT = [cableExit.z, 1.6, 0.5];

/** Particle positions with the little rise at both ends, for drawing */
export function cablePoints(sim: CableSim): Point3[] {
  const points: Point3[] = [];
  for (let index = 0; index < COUNT; index++) {
    points.push({
      x: sim.x[index],
      y: sim.y[index],
      z: GROMMET_LIFT[index] ?? MOUSE_LIFT[LAST - index] ?? 0,
    });
  }
  return points;
}
