import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface MarkdownFile {
  slug: string;
  data: Record<string, unknown>;
  content: string;
}

const MARKDOWN_EXTENSION = ".md";

const toSlug = (fileName: string) => fileName.replace(/\.md$/, "");

export const listMarkdownSlugs = (directory: string): string[] =>
  fs
    .readdirSync(directory)
    .filter((name) => name.endsWith(MARKDOWN_EXTENSION))
    .map(toSlug);

export const readMarkdownFile = (
  directory: string,
  slug: string
): MarkdownFile | undefined => {
  const fullPath = path.join(directory, `${slug}${MARKDOWN_EXTENSION}`);

  try {
    const { data, content } = matter(fs.readFileSync(fullPath, "utf8"));
    return { slug, data, content };
  } catch {
    // File not found or unreadable
    return undefined;
  }
};

export const readAllMarkdownFiles = (directory: string): MarkdownFile[] =>
  listMarkdownSlugs(directory)
    .map((slug) => readMarkdownFile(directory, slug))
    .filter((file): file is MarkdownFile => file !== undefined);

export const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;
