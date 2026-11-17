"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import BrowserFrame from "@/components/projects/browser-frame";
import { formatProjectNumber, frameLabel } from "@/lib/project-format";
import { ProjectCardProps } from "@/types";

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const liveLink = project.links[0];

  return (
    <motion.article
      className="card flex flex-col p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link href={`/projects/${project.slug}`} aria-label={project.title}>
        <BrowserFrame
          label={frameLabel(project)}
          image={project.image}
          imageAlt={project.imageAlt}
          fallback={project.category}
        />
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3">
        <p className="font-hand text-xs text-neutral-400">
          {formatProjectNumber(project.order)} · {project.category}
        </p>
        {project.badge && (
          <span className="badge shrink-0">[{project.badge}]</span>
        )}
      </div>
      <h3 className="mt-2 text-lg font-semibold text-neutral-100">
        <Link href={`/projects/${project.slug}`} className="hover:underline">
          {project.title}
        </Link>
      </h3>
      <p className="font-hand text-xs text-neutral-400">{project.tagline}</p>
      <p className="mt-3 text-[13px] leading-relaxed text-neutral-300">
        {project.summary}
      </p>
      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Stack">
        {project.stack.map((item) => (
          <li key={item} className="chip">
            {item}
          </li>
        ))}
      </ul>
      <div className="flex-1" />
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
        <Link
          href={`/projects/${project.slug}`}
          className="link-mono font-semibold text-accent hover:text-sky-300"
        >
          case study ↗
        </Link>
        {liveLink && (
          <a
            href={liveLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="link-mono text-neutral-400"
          >
            {liveLink.label} ↗
          </a>
        )}
      </div>
    </motion.article>
  );
}
