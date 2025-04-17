import Layout from "@/components/layout";
import Title from "@/components/title";
import MoreStories from "@/components/blog/more-stories";
import { getAllPosts } from "@/lib/api";

export const metadata = {
  title: "Blog - Cristian Ariza",
  description:
    "Read my latest blog posts about software development, technology, and more.",
};

export default async function BlogPage() {
  const allPosts = await getAllPosts();

  return (
    <Layout title="Blog">
      <Title text="Blog" />
      {allPosts.length > 0 && <MoreStories posts={allPosts} />}
    </Layout>
  );
}
