export interface Post {
  _id: string;
  slug: string;
  title: string;
  publishedAt: string;
  body?: string;
  excerpt?: string;
}

// Component Props
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

export interface TimeLineItem {
  company: {
    text: string;
    href?: string;
  };
  role: string;
  period?: string;
}

export interface TimeLineProps {
  data: TimeLineItem[];
  title: string;
}

export interface TitleProps {
  text: string;
  size?: "small" | "large";
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
