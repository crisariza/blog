import { OFFICE_CABINET } from "@/lib/office-objects";
import type { DrawerItemKind, OfficeDrawer, Point } from "@/types";

/**
 * The cabinet's drawers and what's inside them, in centimeters and seconds.
 *
 * A drawer runs on wooden runners: friction does most of the work, a click is
 * a pull or a push that coasts into the end stop with a small bounce, and
 * dragging the front moves it with the hand. What's inside feels every jolt:
 * the ball rolls (a hollow shell rolling without slipping keeps 3/5 of the
 * drawer's acceleration as relative motion) and bounces off the walls, the
 * controller and the remote only slide when a jolt beats their grip.
 */

const STEP = 1 / 240;
const MAX_FRAME_TIME = 1 / 20;
const GRAVITY = 981;

/** Wood on wood, waxed */
const RUNNER_FRICTION = 0.16;
/** Bounce off the end stops */
const STOP_RESTITUTION = 0.15;
/**
 * A pull is a little harder than what friction alone would stop at the end,
 * so it reaches the stop gently; a push to close lands with a firmer thunk.
 */
const PULL_STRENGTH = 1.08;
const PUSH_STRENGTH = 1.22;
/** The last stretch before shut, where the drawer's catch draws it closed (cm, cm/s²) */
const CATCH_RANGE = 1.5;
const CATCH_PULL = 320;
/** How tightly a dragged drawer follows the hand */
const DRAG_FREQUENCY = 28;

/** Hollow sphere rolling without slipping: I = 2/3 m r² */
const BALL_ROLL_FACTOR = 0.6;
const BALL_ROLLING_RESISTANCE = 0.025;
const BALL_RESTITUTION = 0.55;
export const BALL_RADIUS = 10.25;

const ITEM_STATIC_FRICTION = 0.55;
const ITEM_KINETIC_FRICTION = 0.4;
const ITEM_RESTITUTION = 0.2;

const SLEEP_SPEED = 0.15;
const SLEEP_STEPS = 60;

const DRAWER_WIDTH = OFFICE_CABINET.frontMaxX - OFFICE_CABINET.frontMinX - 1.6;
export const DRAWER_INSIDE = {
  halfWidth: DRAWER_WIDTH / 2 - OFFICE_CABINET.wallThickness,
  depth:
    OFFICE_CABINET.drawerDepth -
    OFFICE_CABINET.frontThickness -
    OFFICE_CABINET.wallThickness,
};
/** How far a drawer's runners let it out, in cm */
export const maxOpenOf = (config: OfficeDrawer) =>
  OFFICE_CABINET.drawerDepth * config.maxOpen;

/**
 * Each item's footprint around its origin, for bumping into the drawer's
 * walls: the controller's coiled cable lies beside and behind it.
 */
const ITEM_FOOTPRINT: Record<DrawerItemKind, { min: Point; max: Point }> = {
  controller: { min: { x: -8.9, y: -8 }, max: { x: 11.8, y: 15.8 } },
  remote: { min: { x: -7.8, y: -5.6 }, max: { x: 8, y: 5.6 } },
  ball: {
    min: { x: -BALL_RADIUS, y: -BALL_RADIUS },
    max: { x: BALL_RADIUS, y: BALL_RADIUS },
  },
};
/** Above this speed (cm/s) outwards a drawer counts as opening */
const OPENING_SPEED = 5;

export interface DrawerItem {
  kind: DrawerItemKind;
  /** Position from the middle of the drawer (x) and its inside front wall (y) */
  position: Point;
  velocity: Point;
  angle: number;
  /** Rolling orientation of the ball, as a quaternion [x, y, z, w] */
  spin: [number, number, number, number];
}

export interface DrawerState {
  config: OfficeDrawer;
  /** How far it's pulled out */
  open: number;
  velocity: number;
  /** Where the hand holds it while it's being dragged */
  grab: number | null;
  item: DrawerItem;
}

export interface DrawerSim {
  drawers: DrawerState[];
  accumulator: number;
  quietSteps: number;
  asleep: boolean;
}

export function createDrawerSim(): DrawerSim {
  return {
    drawers: OFFICE_CABINET.drawers.map((config) => ({
      config,
      open: 0,
      velocity: 0,
      grab: null,
      item: {
        kind: config.item,
        position: { ...config.itemStart },
        velocity: { x: 0, y: 0 },
        angle: config.itemAngle,
        spin: [0, 0, 0, 1],
      },
    })),
    accumulator: 0,
    quietSteps: 0,
    asleep: true,
  };
}

export const isOpenish = (drawer: DrawerState) =>
  drawer.open > maxOpenOf(drawer.config) / 2 || drawer.velocity > OPENING_SPEED;

/** Speed a drawer needs to coast a distance against runner friction */
const coastSpeed = (distance: number) =>
  Math.sqrt(2 * RUNNER_FRICTION * GRAVITY * Math.max(distance, 0));

/** A click: pull it out if it's mostly shut, push it shut otherwise */
export function toggleDrawer(sim: DrawerSim, index: number, instant = false) {
  const drawer = sim.drawers[index];
  const opening = !isOpenish(drawer);
  wake(sim);
  if (instant) {
    drawer.open = opening ? maxOpenOf(drawer.config) : 0;
    drawer.velocity = 0;
    return;
  }
  drawer.velocity = opening
    ? coastSpeed(maxOpenOf(drawer.config) - drawer.open) * PULL_STRENGTH
    : -coastSpeed(drawer.open) * PUSH_STRENGTH;
}

export function grabDrawer(sim: DrawerSim, index: number, open: number) {
  const drawer = sim.drawers[index];
  drawer.grab = Math.min(maxOpenOf(drawer.config), Math.max(0, open));
  wake(sim);
}

export function releaseDrawer(sim: DrawerSim, index: number) {
  sim.drawers[index].grab = null;
  wake(sim);
}

function wake(sim: DrawerSim) {
  sim.asleep = false;
  sim.quietSteps = 0;
}

/** Runner friction, or the hand's spring while dragged */
function drawerAcceleration(drawer: DrawerState) {
  if (drawer.grab !== null) {
    return (
      DRAG_FREQUENCY ** 2 * (drawer.grab - drawer.open) -
      2 * DRAG_FREQUENCY * drawer.velocity
    );
  }
  const friction =
    drawer.velocity === 0
      ? 0
      : -Math.sign(drawer.velocity) * RUNNER_FRICTION * GRAVITY;
  const inCatch = drawer.open > 0 && drawer.open < CATCH_RANGE;
  return inCatch ? friction - CATCH_PULL : friction;
}

function moveDrawer(drawer: DrawerState) {
  const before = drawer.velocity;
  const acceleration = drawerAcceleration(drawer);
  let velocity = before + acceleration * STEP;
  // Friction stops it rather than pushing it back the other way
  const reversed = before !== 0 && Math.sign(velocity) !== Math.sign(before);
  if (drawer.grab === null && reversed && drawer.open >= CATCH_RANGE) {
    velocity = 0;
  }
  drawer.open += velocity * STEP;
  if (drawer.open < 0) {
    drawer.open = 0;
    velocity = -velocity * STOP_RESTITUTION;
  } else if (drawer.open > maxOpenOf(drawer.config)) {
    drawer.open = maxOpenOf(drawer.config);
    velocity = -velocity * STOP_RESTITUTION;
  }
  drawer.velocity = velocity;
  return (velocity - before) / STEP;
}

/** Keeps an item inside the drawer, bouncing it off the walls */
function containItem(item: DrawerItem, restitution: number) {
  const { min: low, max: high } = ITEM_FOOTPRINT[item.kind];
  const limits: [keyof Point, number, number][] = [
    ["x", -DRAWER_INSIDE.halfWidth - low.x, DRAWER_INSIDE.halfWidth - high.x],
    ["y", -low.y, DRAWER_INSIDE.depth - high.y],
  ];
  for (const [axis, min, max] of limits) {
    if (item.position[axis] < min && item.velocity[axis] < 0) {
      item.position[axis] = min;
      item.velocity[axis] *= -restitution;
    } else if (item.position[axis] > max && item.velocity[axis] > 0) {
      item.position[axis] = max;
      item.velocity[axis] *= -restitution;
    }
  }
}

/** Slows a velocity by a constant deceleration without reversing it */
function decelerate(velocity: Point, amount: number) {
  const speed = Math.hypot(velocity.x, velocity.y);
  if (speed <= amount) {
    velocity.x = 0;
    velocity.y = 0;
    return;
  }
  velocity.x *= 1 - amount / speed;
  velocity.y *= 1 - amount / speed;
}

/**
 * The drawer accelerating outwards (towards −y on the desk) pushes what's in
 * it towards the back, which is +y inside the drawer.
 */
function rollBall(item: DrawerItem, drawerAcceleration: number) {
  item.velocity.y += BALL_ROLL_FACTOR * drawerAcceleration * STEP;
  decelerate(item.velocity, BALL_ROLLING_RESISTANCE * GRAVITY * STEP);
  item.position.x += item.velocity.x * STEP;
  item.position.y += item.velocity.y * STEP;
  containItem(item, BALL_RESTITUTION);
  spinBall(item);
}

/** Rolling without slipping: ω = up × v / r, integrated as a quaternion */
function spinBall(item: DrawerItem) {
  const wx = -item.velocity.y / BALL_RADIUS;
  const wy = item.velocity.x / BALL_RADIUS;
  const [x, y, z, w] = item.spin;
  const half = STEP / 2;
  const next: [number, number, number, number] = [
    x + half * (wx * w + wy * z),
    y + half * (wy * w - wx * z),
    z + half * (wx * y - wy * x),
    w + half * (-wx * x - wy * y),
  ];
  const norm = Math.hypot(...next);
  item.spin = next.map((value) => value / norm) as typeof next;
}

/** Coulomb friction with the drawer's floor: it only slides when the jolt beats its grip */
function slideItem(item: DrawerItem, drawerAcceleration: number) {
  const { velocity } = item;
  const still = velocity.x === 0 && velocity.y === 0;
  if (still && Math.abs(drawerAcceleration) <= ITEM_STATIC_FRICTION * GRAVITY) {
    return;
  }
  velocity.y += drawerAcceleration * STEP;
  decelerate(velocity, ITEM_KINETIC_FRICTION * GRAVITY * STEP);
  item.position.x += velocity.x * STEP;
  item.position.y += velocity.y * STEP;
  containItem(item, ITEM_RESTITUTION);
}

function stepDrawer(drawer: DrawerState) {
  const acceleration = moveDrawer(drawer);
  if (drawer.item.kind === "ball") rollBall(drawer.item, acceleration);
  else slideItem(drawer.item, acceleration);
}

function isStill(drawer: DrawerState) {
  const { velocity } = drawer.item;
  return (
    drawer.grab === null &&
    Math.abs(drawer.velocity) < SLEEP_SPEED &&
    Math.hypot(velocity.x, velocity.y) < SLEEP_SPEED
  );
}

/** Advances the drawers by the time since the last frame, in fixed steps */
export function advanceDrawerSim(sim: DrawerSim, elapsedSeconds: number) {
  if (sim.asleep) return;
  sim.accumulator += Math.min(elapsedSeconds, MAX_FRAME_TIME);
  while (sim.accumulator >= STEP) {
    sim.drawers.forEach(stepDrawer);
    sim.accumulator -= STEP;
    const still = sim.drawers.every(isStill);
    sim.quietSteps = still ? sim.quietSteps + 1 : 0;
  }
  sim.asleep = sim.quietSteps > SLEEP_STEPS;
}

/** Shut to within a fraction of a pixel */
const SHUT = 0.02;

export const allClosed = (sim: DrawerSim) =>
  sim.drawers.every((drawer) => drawer.open < SHUT);
