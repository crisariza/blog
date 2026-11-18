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

export interface DeskLampProps {
  isOn: boolean;
  onToggle: () => void;
}
