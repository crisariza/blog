import Layout from "@/components/layout";
import TimeLine from "@/components/timeline";

interface Experience {
  company: {
    text: string;
    href?: string;
  };
  role: string;
  period: string;
}

export default function Home() {
  const experiences: Experience[] = [
    {
      company: { text: "Accenture" },
      role: "Software Engineer",
      period: "2021 — Present",
    },
  ];

  const projects: Experience[] = [
    {
      company: { href: "https://museogranate.com", text: "Museo Granate" },
      role: "Software Engineer",
      period: "2025 — Present",
    },
  ];

  return (
    <Layout>
      <TimeLine data={experiences} title="Experience" />
      <br />
      <TimeLine data={projects} title="Projects" />
    </Layout>
  );
}
