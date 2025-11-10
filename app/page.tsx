import TimeLine from "@/components/timeline";
import { TimeLineItem } from "@/types";

export default function Home() {
  const experiences: TimeLineItem[] = [
    {
      company: { text: "Accenture" },
      role: "Software Engineer",
      period: "2021 — Present",
    },
  ];

  const projects: TimeLineItem[] = [
    {
      company: { href: "https://museogranate.com", text: "Museo Granate" },
      role: "Product Engineer",
    },
  ];

  return (
    <>
      <TimeLine data={experiences} title="Experience" />
      <br />
      <TimeLine data={projects} title="Projects" />
    </>
  );
}
