"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import BrowserFrame from "@/components/projects/browser-frame";
import { formatProjectNumber, frameLabel } from "@/lib/project-format";
import { ProjectHeaderProps } from "@/types";

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  const meta = [project.role, project.company, project.period]
    .filter(Boolean)
    .join(" · ");

  return (
    <motion.div
      className="mb-10 space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link href="/projects" className="link-mono text-neutral-500">
        ← all work
      </Link>
      <div className="flex items-start justify-between gap-3">
        <p className="font-hand text-sm text-neutral-400">
          {formatProjectNumber(project.order)} · {project.category}
        </p>
        {project.badge && (
          <span className="badge shrink-0">[{project.badge}]</span>
        )}
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-100 md:text-3xl">
          {project.title}
        </h1>
        <p className="mt-1 font-hand text-sm text-neutral-400">
          {project.tagline}
        </p>
        <p className="mt-2 font-mono text-xs text-neutral-500">{meta}</p>
      </div>
      <p className="text-neutral-300">{project.summary}</p>
      <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
        {project.stack.map((item) => (
          <li key={item} className="chip">
            {item}
          </li>
        ))}
      </ul>
      {project.links.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {project.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-mono font-semibold text-accent hover:text-sky-300"
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      )}
      <BrowserFrame
        label={frameLabel(project)}
        image={project.image}
        imageAlt={project.imageAlt}
        fallback={project.category}
        priority
      />
    </motion.div>
  );
}
