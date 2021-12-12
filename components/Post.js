import Link from "next/link";

export default function Post({ post }) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg text-white">
      <img className="rounded-lg" src={post.frontmatter.cover_image} alt="" />
      <h1 className="mt-2 text-xl font-bold	text-purple-400">
        {post.frontmatter.title}
      </h1>
      <h2 className="rounded-lg text-gray-400">
        {post.frontmatter.date} · {post.frontmatter.category}
      </h2>
      <p className="mt-2">{post.frontmatter.description}</p>
      <Link href={`/blog/${post.slug}`}>
        <button className="bg-gray-100 mt-4 p-2 pt-1 pb-1 rounded-lg text-black">
          Read More
        </button>
      </Link>
    </div>
  );
}
