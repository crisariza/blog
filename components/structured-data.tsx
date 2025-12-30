import { Post, StructuredDataProps } from "@/types";

export default function StructuredData({
  type = "home",
  post,
}: StructuredDataProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://crisariza.com";

  const getStructuredData = () => {
    if (type === "article" && post) {
      return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt || "",
        author: {
          "@type": "Person",
          name: "Cristian Ariza",
        },
        publisher: {
          "@type": "Person",
          name: "Cristian Ariza",
        },
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${siteUrl}/blog/${post.slug}`,
        },
      };
    }

    if (type === "blog") {
      return {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Cristian Ariza's Blog",
        url: `${siteUrl}/blog`,
        description:
          "Blog posts about software development, technology, and more",
        author: {
          "@type": "Person",
          name: "Cristian Ariza",
        },
        publisher: {
          "@type": "Person",
          name: "Cristian Ariza",
        },
      };
    }

    // Default: home page
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Cristian Ariza",
      jobTitle: "Software Engineer",
      description:
        "Software Engineer with 4 years of hands-on experience in front-end and back-end development. Eager in startups that create awesome products.",
      url: siteUrl,
      sameAs: [],
      knowsAbout: [
        "Software Development",
        "Front-end Development",
        "Back-end Development",
        "Web Development",
        "Technology",
      ],
    };
  };

  const structuredData = getStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
