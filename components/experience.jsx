export default function ExperienceTimeline() {
  const experiences = [
    {
      company: "Accenture",
      role: "Senior Software Engineer",
      period: "2021 — Present",
    },
  ];

  return (
    <div className="mt-10">
      <div className="mx-auto space-y-8">
        {experiences.map((experience, index) => (
          <div
            key={index}
            className="border-b border-zinc-800 pb-8 last:border-b-0"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-white text-xl font-medium">
                {experience.company}
              </h3>
              <span className="text-zinc-600 font-mono">
                {experience.period}
              </span>
            </div>
            <p className="text-zinc-500 mt-1">{experience.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
