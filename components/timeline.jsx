import Title from "./title";
import Link from "next/link";
export default function TimeLine({ data, title }) {
  return (
    <div>
      <Title text={title} size="small"></Title>
      <div className="mx-auto space-y-8">
        {data.map((experience, index) => (
          <div key={index} className="border-b border-neutral-700 pb-8 ">
            <div className="flex justify-between items-center">
              <h3 className="text-neutral-200 text-xl font-medium">
                {experience.company.href ? (
                  <Link
                    href={experience.company.href}
                    className="flex items-center gap-1 hover:text-neutral-400"
                    target="_blank"
                  >
                    {experience.company.text}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="inline-block"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </Link>
                ) : (
                  experience.company.text
                )}
              </h3>
              <span className="text-neutral-400">{experience.period}</span>
            </div>
            <p className="text-neutral-400 mt-1">{experience.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
