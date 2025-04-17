import { getPostBySlug, getAllPosts } from "@/lib/api";
import Layout from "@/components/layout";
import PostBody from "@/components/blog/post-body";
import PostHeader from "@/components/blog/post-header";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const post = await getPostBySlug({ slug: params.slug });

  if (!post) {
    return {
      title: "Post Not Found - Cristian Ariza",
    };
  }

  return {
    title: `${post.title} - Cristian Ariza`,
    description: post.excerpt,
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }) {
  const post = await getPostBySlug({ slug: params.slug });

  if (!post) {
    notFound();
  }

  return (
    <Layout title={post.title}>
      <article>
        <PostHeader title={post.title} publishedAt={post.publishedAt} />
        <PostBody body={post.body} />
      </article>
    </Layout>
  );
}
