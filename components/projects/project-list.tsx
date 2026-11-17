import ProjectCard from "@/components/projects/project-card";
import { ProjectListProps } from "@/types";

export default function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {projects.map((project, index) => (
        <ProjectCard key={project.slug} project={project} index={index} />
      ))}
    </div>
  );
}
