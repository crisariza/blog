const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://crisariza.com";

const PERSON_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Cristian Ariza",
  jobTitle: "Senior Product Engineer",
  description:
    "Product engineer who ships end to end: TypeScript back ends, React Native apps and AI agents in production.",
  url: SITE_URL,
  sameAs: [
    "https://github.com/crisariza",
    "https://www.linkedin.com/in/crisariza",
  ],
  knowsAbout: [
    "Product Engineering",
    "TypeScript",
    "React",
    "React Native",
    "AI Agents",
  ],
};

export default function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(PERSON_STRUCTURED_DATA),
      }}
    />
  );
}
