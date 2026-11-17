import path from "path";
import { GetPostBySlugParams, Project, ProjectLink } from "@/types";
import {
  MarkdownFile,
  asString,
  readAllMarkdownFiles,
  readMarkdownFile,
} from "@/lib/markdown";

const projectsDirectory = path.join(process.cwd(), "lib/projects");

// Projects without an explicit order go last
const DEFAULT_ORDER = Number.MAX_SAFE_INTEGER;

const asStringList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const isProjectLink = (value: unknown): value is ProjectLink => {
  if (typeof value !== "object" || value === null) return false;

  const { label, href } = value as Record<string, unknown>;
  return typeof label === "string" && typeof href === "string";
};

const asLinks = (value: unknown): ProjectLink[] =>
  Array.isArray(value) ? value.filter(isProjectLink) : [];

const asOptionalString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const toProject = ({ slug, data, content }: MarkdownFile): Project => ({
  slug,
  title: asString(data.title, "Untitled"),
  summary: asString(data.summary),
  company: asString(data.company),
  role: asString(data.role),
  period: asString(data.period),
  order: typeof data.order === "number" ? data.order : DEFAULT_ORDER,
  category: asString(data.category),
  badge: asString(data.badge),
  tagline: asString(data.tagline),
  stack: asStringList(data.stack),
  links: asLinks(data.links),
  image: asOptionalString(data.image),
  imageAlt: asOptionalString(data.imageAlt),
  body: content,
});

export const getAllProjects = async (): Promise<Project[]> =>
  readAllMarkdownFiles(projectsDirectory)
    .map(toProject)
    .sort((a, b) => a.order - b.order);

export async function getProjectBySlug({
  slug,
}: GetPostBySlugParams): Promise<Project | undefined> {
  const file = readMarkdownFile(projectsDirectory, slug);
  return file ? toProject(file) : undefined;
}
