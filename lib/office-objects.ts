import { OfficeObject, Point } from "@/types";

/** The scene images and the coordinate space everything else is drawn in */
export const OFFICE_SCENE = {
  src: "/office/office-on-v4.webp",
  srcLampOff: "/office/office-off-v4.webp",
  /** Square crop centered on the cubicle, with the mouse still on the desk */
  polaroidSrc: "/office/office-polaroid-v4.webp",
  polaroidSize: 900,
  alt: "Isometric illustration of Cris coding at his desk in a navy cubicle, with a Club Atlético Lanús pennant, Vercel mints, a steel mug and framed posters",
  width: 2336,
  height: 1744,
  /** Horizontal slice that is shown, so the cubicle sits in the middle of the frame */
  view: { x: 376, width: 1960 },
};

/** The draggable mouse, its cable and the desk area it can move in */
export const OFFICE_MOUSE = {
  src: "/office/mouse.png",
  width: 112,
  height: 81,
  start: { x: 1570, y: 824 } satisfies Point,
  /** Where the cable leaves the mouse, relative to the sprite's top-left corner */
  cableOffset: { x: 88, y: 14 } satisfies Point,
  /** The desk grommet both cables drop through, down to the PC under the desk */
  cableAnchor: { x: 1625, y: 748 } satisfies Point,
  grommet: { radiusX: 13, radiusY: 7 },
  /** The keyboard's cable, from its back edge into the grommet */
  keyboardCable: {
    start: { x: 1500, y: 733 } satisfies Point,
    control: { x: 1555, y: 722 } satisfies Point,
  },
  cableLength: 300,
  /** Area the mouse's center can move in: the free part of the desk top */
  deskArea: [
    { x: 1560, y: 845 },
    { x: 1600, y: 800 },
    { x: 1660, y: 815 },
    { x: 1760, y: 845 },
    { x: 2000, y: 870 },
    { x: 1860, y: 975 },
    { x: 1600, y: 875 },
    { x: 1565, y: 862 },
  ] satisfies Point[],
  /** Desk objects the mouse bumps into, as ellipses around the mouse's center */
  obstacles: [
    { center: { x: 1816, y: 886 }, radiusX: 118, radiusY: 84 },
    { center: { x: 1965, y: 888 }, radiusX: 96, radiusY: 70 },
  ],
  /** Desk objects the cable wraps around instead of crossing */
  cableObstacles: [
    { center: { x: 1816, y: 886 }, radiusX: 74, radiusY: 52 },
    { center: { x: 1965, y: 888 }, radiusX: 50, radiusY: 32 },
  ],
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
    mask: "/office/mask-mug-v2.png",
    hotspot: [
      [1262, 566],
      [1282, 558],
      [1298, 545],
      [1345, 540],
      [1370, 552],
      [1369, 641],
      [1330, 651],
      [1296, 641],
      [1278, 620],
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
    mask: "/office/mask-mints.png",
    hotspot: [
      [1752, 862],
      [1850, 840],
      [1880, 905],
      [1782, 928],
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
