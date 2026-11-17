import path from "path";
import { Post, GetPostBySlugParams } from "@/types";
import {
  MarkdownFile,
  asString,
  readAllMarkdownFiles,
  readMarkdownFile,
} from "@/lib/markdown";

const postsDirectory = path.join(process.cwd(), "lib");

const toPost = ({ slug, data, content }: MarkdownFile): Post => ({
  _id: slug,
  slug,
  title: asString(data.title, "Untitled"),
  publishedAt: asString(data.date, new Date().toISOString()),
  body: content,
  excerpt: asString(data.excerpt),
});

export const getAllPosts = async (): Promise<Post[]> =>
  readAllMarkdownFiles(postsDirectory)
    .map(toPost)
    // Newest first
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

export async function getPostBySlug({
  slug,
}: GetPostBySlugParams): Promise<Post | undefined> {
  const file = readMarkdownFile(postsDirectory, slug);
  return file ? toPost(file) : undefined;
}
