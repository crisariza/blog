import Title from "@/components/title";
import MoreStories from "@/components/blog/more-stories";
import { getAllPosts } from "@/lib/api";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Cristian Ariza",
  description:
    "Read my latest blog posts about software development, technology, and more.",
};

export default async function BlogPage() {
  const allPosts = await getAllPosts();

  return (
    <>
      <Title text="Blog" size="small" />
      {allPosts.length > 0 && <MoreStories posts={allPosts} />}
    </>
  );
}
