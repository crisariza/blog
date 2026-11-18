export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  company: string;
  role: string;
  period: string;
  order: number;
  category: string;
  badge: string;
  tagline: string;
  stack: string[];
  links: ProjectLink[];
  image?: string;
  imageAlt?: string;
  /** Label for the browser frame when the first link isn't the right one (e.g. a Figma file) */
  frame?: string;
  body: string;
}

// Component Props
export interface ProjectListProps {
  projects: Project[];
}

export interface ProjectCardProps {
  project: Project;
  index?: number;
}

export interface BrowserFrameProps {
  label: string;
  image?: string;
  imageAlt?: string;
  fallback: string;
  priority?: boolean;
}

export interface ProjectHeaderProps {
  project: Project;
}

export interface PostBodyProps {
  body: string;
}

export interface Experience {
  company: string;
  href?: string;
  kind: string;
  role: string;
  period: string;
  location: string;
  description: string;
  tags: string[];
}

export interface ExperienceListProps {
  experiences: Experience[];
}

export interface TitleProps {
  text: string;
  eyebrow?: string;
}

// API & Page Props
export interface GetPostBySlugParams {
  slug: string;
}

export interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Office scene
export type OfficeObjectModel = "pennant" | "mints" | "mug";

/** A piece of text that can optionally link somewhere */
export interface TextSegment {
  text: string;
  href?: string;
}

export interface OfficeObjectPhoto {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

export interface OfficeObject {
  id: string;
  title: string;
  description: TextSegment[];
  model: OfficeObjectModel;
  /** Full-scene PNG whose alpha is the object's exact silhouette, for the hover glow */
  mask: string;
  /** Polygon over the scene image, in the image's pixel coordinates */
  hotspot: [number, number][];
  /** CSS background for the 3D viewer panel */
  backdrop: string;
  link?: { label: string; href: string };
  photo?: OfficeObjectPhoto;
}

export interface OfficeSceneDialogProps {
  onClose: () => void;
}

export interface OfficeObjectDialogProps {
  object: OfficeObject;
  onClose: () => void;
}

export interface ObjectViewerProps {
  model: OfficeObjectModel;
}

export interface RichTextProps {
  segments: TextSegment[];
}

export interface Point {
  x: number;
  y: number;
}

export interface OfficeSceneProps {
  onSelect: (object: OfficeObject) => void;
}

export interface DeskMouseProps {
  lampOn: boolean;
}

/**
 * A desk object the mouse and its cable can pass behind: a cut-out of the
 * scene image redrawn on top of them, by polygon or by a full-scene mask.
 */
export interface OfficeOccluder {
  id: string;
  /** Index of its footprint in OFFICE_DESK.obstacles, to tell in front from behind */
  obstacle: number;
  /** Outline in scene pixels */
  polygon?: [number, number][];
  /** Full-scene PNG whose alpha is the object's silhouette */
  mask?: string;
}

export interface DeskLampProps {
  isOn: boolean;
  onToggle: () => void;
}

export interface Point3 extends Point {
  z: number;
}

/** Axis-aligned rectangle on the desk plane, in centimeters */
export interface DeskBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** Footprint of a desk object on the desk plane, in centimeters */
export type DeskObstacle =
  | { kind: "circle"; center: Point; radius: number }
  | {
      kind: "box";
      center: Point;
      halfSize: Point;
      /** Rotation around the vertical axis, in radians */
      angle: number;
      /** Corner rounding */
      radius: number;
    };

export type DrawerItemKind = "controller" | "remote" | "ball";

/** One drawer of the desk's cabinet, in centimeters on the desk frame */
export interface OfficeDrawer {
  id: string;
  label: string;
  /** Height of the drawer front's top and bottom edges */
  top: number;
  bottom: number;
  item: DrawerItemKind;
  /** How far its runners let it out, as a fraction of its depth */
  maxOpen: number;
  /** Where the item rests, from the middle of the drawer and its inside front wall */
  itemStart: Point;
  /** Turn of the item around the vertical axis, in radians */
  itemAngle: number;
}

export interface DeskDrawersProps {
  lampOn: boolean;
}
