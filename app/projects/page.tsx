import { Metadata } from "next";
import Title from "@/components/title";
import ProjectList from "@/components/projects/project-list";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects - Cristian Ariza",
  description:
    "Case studies of products I designed and built: AI agents, identity and ticketing, data pipelines and mobile apps.",
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <>
      <Title text="things i've built & shipped" eyebrow="Work" />
      <p className="mb-8 max-w-xl text-neutral-400">
        Products I designed and built end to end, at Paisanos and as the lead
        engineer of Club Atlético Lanús. Most of them were built with AI coding
        agents that I directed and reviewed, inside the guardrails I set up:
        typed contracts, 100% coverage gates and end-to-end tests on every PR.
      </p>
      <ProjectList projects={projects} />
    </>
  );
}
