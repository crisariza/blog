import { Metadata } from "next";
import { notFound } from "next/navigation";
import PostBody from "@/components/blog/post-body";
import ProjectHeader from "@/components/projects/project-header";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { PageProps } from "@/types";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug({ slug });

  if (!project) {
    return { title: "Project Not Found - Cristian Ariza" };
  }

  const title = `${project.title} - Cristian Ariza`;

  return {
    title,
    description: project.summary,
    openGraph: { title, description: project.summary, type: "article" },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.summary,
    },
  };
}

export async function generateStaticParams() {
  const projects = await getAllProjects();

  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug({ slug });

  if (!project) {
    notFound();
  }

  return (
    <article>
      <ProjectHeader project={project} />
      <PostBody body={project.body} />
    </article>
  );
}
