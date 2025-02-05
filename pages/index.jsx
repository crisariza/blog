import Layout from "../components/layout";
import TimeLine from "../components/timeline";

export default function Index() {
  const experiences = [
    {
      company: "Accenture",
      role: "Senior Software Engineer",
      period: "2021 — Present",
    },
  ];

  const projects = [
    {
      company: "Club Lanús",
      role: "Product Engineer",
      period: "2024 — Present",
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
