import Title from "./title";

export default function TimeLine({ data, title }) {
  return (
    <div>
      <Title text={title} size="small"></Title>
      <div className="mx-auto space-y-8">
        {data.map((experience, index) => (
          <div key={index} className="border-b border-neutral-700 pb-8 ">
            <div className="flex justify-between items-center">
              <h3 className="text-neutral-200 text-xl font-medium">
                {experience.company}
              </h3>
              <span className="text-neutral-600">{experience.period}</span>
            </div>
            <p className="text-neutral-500 mt-1">{experience.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
