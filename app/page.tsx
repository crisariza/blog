import Link from "next/link";
import Title from "@/components/title";
import ProjectList from "@/components/projects/project-list";
import ExperienceList from "@/components/experience-list";
import OfficePolaroid from "@/components/office/office-polaroid";
import { getAllProjects } from "@/lib/projects";
import { Experience } from "@/types";

const SOCIALS = [
  { label: "github", href: "https://github.com/crisariza" },
  { label: "linkedin", href: "https://linkedin.com/in/crisariza" },
  { label: "email", href: "mailto:mecrisariza@gmail.com" },
  { label: "resume", href: "/resume" },
];

const EXPERIENCES: Experience[] = [
  {
    company: "Paisanos",
    href: "https://paisanos.io",
    kind: "experience",
    role: "Product Engineer",
    period: "2026 — Present",
    location: "Remote",
    description:
      "Design and engineering studio. I own Premedic's WhatsApp AI agent and API layer, took over their legacy React Native app, and built the launch site for Soffi.",
    tags: ["React Native", "Mastra", "Express", "Next.js", "Design systems"],
  },
  {
    company: "Club Atlético Lanús",
    kind: "volunteer",
    role: "Head of Engineering",
    period: "2024 — Present",
    location: "Buenos Aires",
    description:
      "I started and lead the club's engineering: single sign-on and digital tickets, the historical archive, an AI assistant and the platform every repo is built on.",
    tags: ["Node.js", "Better Auth", "Postgres", "Expo", "AI SDK"],
  },
  {
    company: "Accenture",
    kind: "experience",
    role: "Senior Software Engineer",
    period: "2021 — 2026",
    location: "Buenos Aires",
    description:
      "Back end for an AI chatbot that audited source code for security issues, API performance work and a platform coordinating security tooling for 150+ apps.",
    tags: ["Node.js", "Python", "Next.js", "OpenAI"],
  },
];

const HIGHLIGHT_CLASS =
  "rounded bg-surface-hover px-1 font-mono text-[0.9em] text-neutral-100";

export default async function Home() {
  const projects = await getAllProjects();

  return (
    <div className="space-y-20">
      <section className="flex flex-col gap-10 pt-6 sm:flex-row sm:items-center sm:gap-12">
        <OfficePolaroid />
        <div>
          <p className="font-hand text-3xl text-neutral-100 md:text-4xl">
            hey i am{" "}
            <span className="rounded bg-surface-hover px-2 text-accent">
              cris
            </span>
          </p>
          <div className="mt-6 max-w-xl space-y-3 text-neutral-300">
            <p>
              Product engineer who ships end to end:{" "}
              <span className={HIGHLIGHT_CLASS}>TypeScript</span> back ends,{" "}
              <span className={HIGHLIGHT_CLASS}>React Native</span> apps and{" "}
              <span className={HIGHLIGHT_CLASS}>AI agents</span> in production.
            </p>
            <p>
              I work AI-native: I design, direct and review coding agents inside
              strict guardrails, so moving fast doesn&apos;t mean breaking
              things.
            </p>
            <p>Based in Buenos Aires, working remotely with US time zones.</p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-hand text-xs text-neutral-500">
              socials ➔
            </span>
            {SOCIALS.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target={social.href.startsWith("http") ? "_blank" : undefined}
                className="link-mono"
              >
                {social.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <Title text="things i've built & shipped" />
        <ProjectList projects={projects} />
      </section>

      <section>
        <Title text="my work" />
        <ExperienceList experiences={EXPERIENCES} />
      </section>
    </div>
  );
}
