export interface Post {
  _id: string;
  slug: string;
  title: string;
  publishedAt: string;
  body?: string;
  excerpt?: string;
}

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

export interface WritingListProps {
  posts: Post[];
}

export interface ProjectHeaderProps {
  project: Project;
}

export interface DateFormatterProps {
  publishedAt: string;
  format?: string;
}

export interface MoreStoriesProps {
  posts: Post[];
}

export interface PostBodyProps {
  body: string;
}

export interface PostHeaderProps {
  title: string;
  publishedAt: string;
}

export interface PostPreviewProps {
  title: string;
  publishedAt: string;
  slug: string;
  showYear: boolean;
  index?: number;
}

export interface StructuredDataProps {
  type?: "home" | "blog" | "article";
  post?: Post;
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
