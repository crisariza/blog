export interface Post {
  _id: string;
  slug: string;
  title: string;
  publishedAt: string;
  body?: string;
  excerpt?: string;
}
