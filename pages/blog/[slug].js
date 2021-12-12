import fs from "fs";
import path from "path";
import Head from "next/head";
import matter from "gray-matter";
import marked from "marked";

export default function PostPage({
  frontmatter: { title, date, cover_image, category },
  slug,
  content,
}) {
  return (
    <div className="text-white">
      <Head>
        <title>{title}</title>
      </Head>

      <img className="mt-2 rounded-lg w-1/3" src={cover_image} alt="" />
      <h1 className="mt-2 text-3xl font-bold	text-purple-400">{title}</h1>
      <h2>
        {date} · {category}
      </h2>
      <div
        className="mt-2"
        dangerouslySetInnerHTML={{ __html: marked(content) }}
      ></div>
    </div>
  );
}

export async function getStaticPaths() {
  const files = fs.readdirSync(path.join("posts"));

  const paths = files.map((filename) => ({
    params: {
      slug: filename.replace(".md", ""),
    },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const markdownWithMeta = fs.readFileSync(
    path.join("posts", slug + ".md"),
    "utf-8"
  );

  const { data: frontmatter, content } = matter(markdownWithMeta);

  return {
    props: {
      frontmatter,
      slug,
      content,
    },
  };
}
