import { OfficeObject, Point } from "@/types";

/** The scene images and the coordinate space everything else is drawn in */
export const OFFICE_SCENE = {
  src: "/office/scene-light-on.jpg",
  srcLampOff: "/office/scene-light-off.jpg",
  /** The polaroid uses the full scene, with the mouse still on the desk */
  polaroidSrc: "/office/scene-polaroid.jpg",
  alt: "Isometric illustration of Cris coding at his desk in a navy cubicle, with a Club Atlético Lanús pennant, Vercel mints, a steel mug and framed posters",
  width: 2336,
  height: 1744,
};

/** The draggable mouse, its cable and the desk area it can move in */
export const OFFICE_MOUSE = {
  src: "/office/mouse.png",
  width: 112,
  height: 81,
  start: { x: 1570, y: 824 } satisfies Point,
  /** Where the cable leaves the mouse, relative to the sprite's top-left corner */
  cableOffset: { x: 108, y: 12 } satisfies Point,
  /** Where the cable disappears behind the monitor */
  cableAnchor: { x: 1692, y: 758 } satisfies Point,
  cableLength: 300,
  /** Area the mouse's center can move in: the free part of the desk top */
  deskArea: [
    { x: 1540, y: 850 },
    { x: 1640, y: 795 },
    { x: 1760, y: 805 },
    { x: 2060, y: 905 },
    { x: 1800, y: 1035 },
    { x: 1555, y: 930 },
  ] satisfies Point[],
  /** Desk objects the mouse bumps into (distance from the mouse's center) */
  obstacles: [
    { center: { x: 1815, y: 885 }, radius: 100 },
    { center: { x: 1962, y: 888 }, radius: 78 },
  ],
};

export const OFFICE_LAMP = {
  /** Small switch on the lamp's base */
  switchPosition: { x: 1990, y: 902 } satisfies Point,
  /** Warm glow around the lampshade */
  glowCenter: { x: 1962, y: 790 } satisfies Point,
  glowRadius: 260,
};

export const OFFICE_MUG = {
  /** Middle of the mug's rim, where the steam starts */
  steamOrigin: { x: 1331, y: 548 } satisfies Point,
  steamWidth: 150,
  steamHeight: 280,
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
    hotspot: [
      [1260, 560],
      [1300, 540],
      [1370, 540],
      [1372, 650],
      [1300, 652],
      [1262, 640],
    ],
    backdrop: "radial-gradient(circle at 50% 40%, #3d4148, #101216)",
    photo: {
      src: "/office/belo-labs.jpg",
      alt: "Group photo of the mentors and builders at Belo Labs",
      caption: "Mentors and builders at Belo Labs.",
      width: 1200,
      height: 589,
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
    hotspot: [
      [1752, 862],
      [1850, 840],
      [1880, 905],
      [1782, 928],
    ],
    backdrop: "radial-gradient(circle at 50% 40%, #3a3a42, #0e0e12)",
    photo: {
      src: "/office/vercel-hq.jpg",
      alt: "Cris and Guillermo Rauch holding a Club Atlético Lanús shirt in front of the Vercel logo",
      caption: "With Guillermo Rauch at Vercel HQ.",
      width: 445,
      height: 689,
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
    hotspot: [
      [1970, 998],
      [2100, 942],
      [2037, 1300],
    ],
    backdrop: "radial-gradient(circle at 50% 40%, #3b4254, #12151d)",
    link: { label: "The club's work", href: "/projects/lanus-platform" },
  },
];
