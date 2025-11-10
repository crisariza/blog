import { getPostBySlug, getAllPosts } from "@/lib/api";
import PostBody from "@/components/blog/post-body";
import PostHeader from "@/components/blog/post-header";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Post, PageProps } from "@/types";
import StructuredData from "@/components/structured-data";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostBySlug({ slug: resolvedParams.slug });

  if (!post) {
    return {
      title: "Post Not Found - Cristian Ariza",
    };
  }

  return {
    title: `${post.title} - Cristian Ariza`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} - Cristian Ariza`,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} - Cristian Ariza`,
      description: post.excerpt,
    },
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();

  return posts.map((post: Post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: PageProps) {
  const resolvedParams = await params;
  const post = await getPostBySlug({ slug: resolvedParams.slug });

  if (!post) {
    notFound();
  }

  return (
    <>
      <StructuredData type="article" post={post} />
      <article>
        <PostHeader title={post.title} publishedAt={post.publishedAt} />
        <PostBody body={post.body || ""} />
      </article>
    </>
  );
}
