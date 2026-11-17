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
