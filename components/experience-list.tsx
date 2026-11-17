import { ExperienceListProps } from "@/types";

export default function ExperienceList({ experiences }: ExperienceListProps) {
  return (
    <div className="card divide-y divide-line">
      {experiences.map((experience, index) => (
        <details
          key={experience.company}
          className="group p-4 sm:p-5"
          open={index === 0}
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-neutral-100">
                  {experience.company}
                </span>
                <span className="rounded-full border border-line px-2 font-mono text-[10px] text-neutral-400">
                  {experience.kind}
                </span>
              </div>
              <p className="text-sm text-neutral-400">{experience.role}</p>
            </div>
            <div className="flex shrink-0 items-start gap-3 text-right">
              <div className="font-mono text-[11px] text-neutral-400">
                <p>{experience.period}</p>
                <p className="text-neutral-500">{experience.location}</p>
              </div>
              <span
                className="font-mono text-xs text-neutral-500 transition-transform group-open:rotate-180"
                aria-hidden
              >
                ⌄
              </span>
            </div>
          </summary>
          <p className="mt-4 text-sm leading-relaxed text-neutral-300">
            {experience.description}
            {experience.href && (
              <>
                {" "}
                <a
                  href={experience.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-inline"
                >
                  {experience.href.replace("https://", "")}
                </a>
              </>
            )}
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Skills">
            {experience.tags.map((tag) => (
              <li key={tag} className="chip">
                {tag}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
