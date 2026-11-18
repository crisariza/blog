import type {
  DeskBounds,
  DeskObstacle,
  OfficeDrawer,
  OfficeObject,
  OfficeOccluder,
  Point,
  Point3,
} from "@/types";

/** The scene images and the coordinate space everything else is drawn in */
export const OFFICE_SCENE = {
  src: "/office/office-on-v5.webp",
  srcLampOff: "/office/office-off-v5.webp",
  /** Square crop centered on the cubicle, with the mouse still on the desk */
  polaroidSrc: "/office/office-polaroid-v4.webp",
  polaroidSize: 900,
  alt: "Isometric illustration of Cris coding at his desk in a navy cubicle, with a Club Atlético Lanús pennant, Vercel mints, a steel mug and framed posters",
  width: 2336,
  height: 1744,
  /** Horizontal slice that is shown, so the cubicle sits in the middle of the frame */
  view: { x: 376, width: 1960 },
};

/**
 * How the desk plane maps onto the scene image (see lib/office-projection.ts).
 * Measured on the image: the desk edges run at exactly ±1:2, and the desk top's
 * front-right corner sits at the origin.
 */
export const OFFICE_PROJECTION = {
  origin: { x: 1795, y: 1053.5 } satisfies Point,
  pixelsPerCm: 7,
  /** Camera elevation of a 2:1 dimetric view: sin(elevation) = tan(atan(1/2)) */
  elevation: Math.PI / 6,
};

/**
 * Footprints of the desk objects, in centimeters on the desk plane. The mouse
 * and its cable collide with these.
 */
export const OFFICE_DESK = {
  /** The desk top: the right edge is x = 0, the front edge y = 0 */
  bounds: { minX: -130, maxX: 0, minY: 0, maxY: 66 } satisfies DeskBounds,
  obstacles: [
    { kind: "circle", center: { x: -18.2, y: 51.9 }, radius: 5.7 },
    {
      kind: "box",
      center: { x: -28.4, y: 32.7 },
      halfSize: { x: 8.8, y: 7 },
      angle: -0.56,
      radius: 3,
    },
    {
      kind: "box",
      center: { x: -98.7, y: 17.6 },
      halfSize: { x: 25.7, y: 8.5 },
      angle: 0.06,
      radius: 2.5,
    },
    {
      kind: "box",
      center: { x: -62, y: 54.6 },
      halfSize: { x: 8, y: 6.5 },
      angle: -0.3,
      radius: 3,
    },
  ] satisfies DeskObstacle[],
};

/** Desk objects that hide the mouse and its cable when they pass behind them */
export const OFFICE_OCCLUDERS: OfficeOccluder[] = [
  {
    id: "lamp",
    obstacle: 0,
    polygon: [
      [1955, 708],
      [1985, 712],
      [2008, 725],
      [2022, 748],
      [2028, 775],
      [2020, 795],
      [1995, 805],
      [1978, 808],
      [1978, 853],
      [1985, 855],
      [2000, 862],
      [2004, 876],
      [1998, 890],
      [1980, 898],
      [1960, 900],
      [1940, 897],
      [1925, 889],
      [1921, 875],
      [1928, 862],
      [1945, 855],
      [1952, 853],
      [1952, 808],
      [1925, 806],
      [1900, 797],
      [1893, 780],
      [1898, 752],
      [1915, 728],
      [1935, 714],
    ],
  },
  { id: "mints", obstacle: 1, mask: "/office/mask-mints-v2.png" },
  {
    id: "keyboard",
    obstacle: 2,
    polygon: [
      [1290, 650],
      [1560, 770],
      [1568, 785],
      [1505, 838],
      [1488, 836],
      [1260, 725],
    ],
  },
  {
    id: "monitor",
    obstacle: 3,
    polygon: [
      [1617, 398],
      [1888, 566],
      [1890, 805],
      [1835, 780],
      [1790, 790],
      [1745, 784],
      [1712, 768],
      [1686, 745],
      [1692, 722],
      [1622, 636],
    ],
  },
];

/** The draggable mouse, in centimeters on the desk plane unless noted */
export const OFFICE_MOUSE = {
  src: "/office/mouse-v2.png",
  /** Sprite size in scene pixels */
  width: 112,
  height: 81,
  /** Sprite pixel right above the middle of the mouse's footprint */
  footprintPixel: { x: 56, y: 50 } satisfies Point,
  /** Middle of the footprint at rest */
  start: { x: -53.3, y: 19.2 } satisfies Point,
  /** The footprint as three discs along the mouse's length */
  bodyRadius: 3.3,
  bodyHalfLength: 2.2,
  /** Where the cable leaves the mouse's back, relative to the footprint */
  cableExit: { x: -0.4, y: 6.6, z: 3 } satisfies Point3,
  /**
   * Where the footprint can go: the free part of the desk, short of the back
   * wall so the cable coming out of the mouse's back has room to bend
   */
  bounds: { minX: -88, maxX: 0, minY: 0, maxY: 62.5 } satisfies DeskBounds,
};

/** The mouse's cable, from the desk grommet to the mouse */
export const OFFICE_CABLE = {
  /** The desk grommet both cables drop through, down to the PC under the desk */
  anchor: { x: -78.9, y: 44.55 } satisfies Point,
  length: 60,
  segments: 32,
  /**
   * How the cable lies when the page loads, one point per particle (cm). It
   * was made by running the simulation: the mouse dragged around the desk and
   * back to its resting spot, so the slack lies in natural curves.
   */
  restingLayout: [
    [-78.9, 44.5],
    [-77.1, 43.9],
    [-75.4, 43.3],
    [-73.6, 42.7],
    [-71.8, 42.2],
    [-70.0, 41.8],
    [-68.1, 41.5],
    [-66.2, 41.4],
    [-64.4, 41.4],
    [-62.5, 41.6],
    [-60.7, 42.0],
    [-58.9, 42.5],
    [-57.1, 43.1],
    [-55.3, 43.7],
    [-53.5, 44.2],
    [-51.7, 44.6],
    [-49.8, 44.9],
    [-47.9, 44.8],
    [-46.1, 44.4],
    [-44.5, 43.5],
    [-43.1, 42.2],
    [-42.3, 40.5],
    [-42.1, 38.6],
    [-42.5, 36.8],
    [-43.4, 35.2],
    [-44.8, 33.9],
    [-46.4, 33.0],
    [-48.2, 32.3],
    [-49.9, 31.6],
    [-51.6, 30.7],
    [-52.9, 29.4],
    [-53.7, 27.7],
    [-53.7, 25.8],
  ] satisfies [number, number][],
  radius: 0.33,
  /** The grommet's opening, in scene pixels */
  grommet: { radiusX: 13, radiusY: 7 },
  /** The keyboard's cable, from its back edge into the grommet (scene pixels) */
  keyboardCable: {
    start: { x: 1500, y: 733 } satisfies Point,
    control: { x: 1555, y: 722 } satisfies Point,
  },
};

/**
 * The cabinet under the desk and its three drawers, in centimeters on the desk
 * frame. The cabinet is flush with the desk's right and front edges; the
 * drawer fronts were measured on the scene image.
 */
export const OFFICE_CABINET = {
  minX: -44.4,
  maxX: 0,
  depth: 66,
  floor: -65.8,
  /** Left and right edges of the drawer fronts */
  frontMinX: -41.4,
  frontMaxX: -3.2,
  frontThickness: 1.8,
  /** The drawer boxes behind the fronts */
  drawerDepth: 50,
  wallThickness: 1.2,
  drawers: [
    {
      id: "top",
      label: "top drawer",
      top: -5.61,
      bottom: -16.66,
      item: "controller",
      maxOpen: 0.74,
      itemStart: { x: -6, y: 22 },
      itemAngle: 0.08,
    },
    {
      id: "middle",
      label: "middle drawer",
      top: -16.66,
      bottom: -30.76,
      item: "remote",
      maxOpen: 0.74,
      itemStart: { x: 1, y: 24 },
      itemAngle: -0.35,
    },
    {
      id: "bottom",
      label: "bottom drawer",
      top: -30.76,
      bottom: -60.87,
      item: "ball",
      // The file drawer runs on full-extension slides
      maxOpen: 0.92,
      itemStart: { x: 3, y: 21 },
      itemAngle: 0,
    },
  ] satisfies OfficeDrawer[],
};

export const OFFICE_LAMP = {
  /** The toggle switch on the lamp's base (it's part of both scene images) */
  switchPosition: { x: 1987, y: 882 } satisfies Point,
  switchRadius: 22,
};

export const OFFICE_MUG = {
  /** Middle of the mug's rim, where the steam starts */
  steamOrigin: { x: 1331, y: 548 } satisfies Point,
  steamWidth: 70,
  steamHeight: 170,
};

export const OFFICE_OBJECTS: OfficeObject[] = [
  {
    id: "belo-labs-mug",
    title: "Belo Labs Mug",
    description: [
      { text: "I was a mentor at " },
      {
        text: "Belo Labs",
        href: "https://x.com/belo_labs/status/2121218648190710262",
      },
      { text: ". Building the future, one coffee at a time." },
    ],
    model: "mug",
    mask: "/office/mask-mug-v3.png",
    hotspot: [
      [1262, 572],
      [1267, 563],
      [1280, 559],
      [1293, 561],
      [1295, 550],
      [1312, 542],
      [1350, 542],
      [1368, 550],
      [1370, 558],
      [1370, 634],
      [1362, 644],
      [1332, 649],
      [1302, 644],
      [1293, 634],
      [1293, 620],
      [1281, 623],
      [1270, 615],
      [1264, 596],
    ],
    backdrop: "radial-gradient(circle at 50% 40%, #3d4148, #101216)",
    photo: {
      src: "/office/belo-labs-v2.jpg",
      alt: "Group photo of the mentors and builders at Belo Labs",
      caption: "Mentors, judges and builders at Belo.",
      width: 2000,
      height: 981,
    },
  },
  {
    id: "vercel-mints",
    title: "Vercel Mints",
    description: [
      { text: "Gifted by " },
      { text: "@evilrabbit_", href: "https://x.com/evilrabbit_" },
      { text: " at Vercel HQ." },
    ],
    model: "mints",
    mask: "/office/mask-mints-v2.png",
    hotspot: [
      [1754, 873],
      [1759, 863],
      [1767, 859],
      [1832, 843],
      [1852, 842],
      [1864, 851],
      [1881, 886],
      [1882, 897],
      [1878, 909],
      [1807, 929],
      [1792, 929],
      [1777, 922],
      [1757, 899],
    ],
    backdrop: "radial-gradient(circle at 50% 40%, #3a3a42, #0e0e12)",
    photo: {
      src: "/office/vercel-hq-v2.jpg",
      alt: "Cris and Guillermo Rauch holding a Club Atlético Lanús shirt in front of the Vercel logo",
      caption: "With Guillermo Rauch at Vercel HQ.",
      width: 1080,
      height: 1674,
    },
  },
  {
    id: "lanus-pennant",
    title: "Club Atlético Lanús Pennant",
    description: [
      {
        text: "I lead the club's engineering as a volunteer: Lanús ID, tickets, football stats and AI agent.",
      },
    ],
    model: "pennant",
    mask: "/office/mask-pennant-v2.png",
    hotspot: [
      [1894, 1036],
      [2024, 980],
      [1961, 1338],
    ],
    backdrop: "radial-gradient(circle at 50% 40%, #3b4254, #12151d)",
    link: { label: "The club's work", href: "/projects/lanus-platform" },
  },
];
