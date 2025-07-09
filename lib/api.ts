import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Post } from "@/lib/types";

const postsDirectory = path.join(process.cwd(), "lib");

export const getAllPosts = async (): Promise<Post[]> => {
  // Get all .md files from the lib directory
  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((name) => name.endsWith(".md"));

  const posts: Post[] = [];

  for (const fileName of fileNames) {
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // Create slug from filename (remove .md extension)
    const slug = fileName.replace(/\.md$/, "");

    posts.push({
      _id: slug,
      slug,
      title: data.title || "Untitled",
      publishedAt: data.date || new Date().toISOString(),
      body: content,
      excerpt: data.excerpt || "",
    });
  }

  // Sort posts by date (newest first)
  posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return posts;
};

interface GetPostBySlugParams {
  slug: string;
}

export async function getPostBySlug({
  slug,
}: GetPostBySlugParams): Promise<Post | undefined> {
  const fileName = `${slug}.md`;
  const fullPath = path.join(postsDirectory, fileName);

  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      _id: slug,
      slug,
      title: data.title || "Untitled",
      publishedAt: data.date || new Date().toISOString(),
      body: content,
      excerpt: data.excerpt || "",
    };
  } catch (error) {
    // File not found or other error
    return undefined;
  }
}
