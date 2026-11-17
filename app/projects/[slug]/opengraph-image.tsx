import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";
import { PageProps } from "@/types";

export const alt = "Project by Cristian Ariza";
export const size = ogSize;
export const contentType = ogContentType;

export async function generateStaticParams() {
  const projects = await getAllProjects();

  return projects.map((project) => ({ slug: project.slug }));
}

export default async function Image({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug({ slug });

  return renderOgImage({
    title: project?.title ?? "Projects",
    subtitle: project?.company ?? "Project by Cristian Ariza",
  });
}
