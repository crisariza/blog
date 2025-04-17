import Layout from "@/components/layout";
import About from "@/components/about";

export const metadata = {
  title: "About - Cristian Ariza",
  description:
    "Learn more about Cristian Ariza, a Software Engineer with experience in front-end and back-end development.",
};

export default function AboutPage() {
  return (
    <Layout title="About">
      <About />
    </Layout>
  );
}
