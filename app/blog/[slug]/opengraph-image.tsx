import { getAllPosts, getPostBySlug } from "@/lib/api";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";
import { PageProps } from "@/types";

export const alt = "Blog post by Cristian Ariza";
export const size = ogSize;
export const contentType = ogContentType;

export async function generateStaticParams() {
  const posts = await getAllPosts();

  return posts.map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug({ slug });

  return renderOgImage({
    title: post?.title ?? "Blog",
    subtitle: post?.excerpt ?? "Blog post by Cristian Ariza",
  });
}
