import Layout from "../../components/layout";
import Title from "../../components/title";
import MoreStories from "../../components/blog/more-stories";
import { getAllPosts } from "../../lib/api";

export default function Blog({ allPosts }) {
  const morePosts = allPosts;

  return (
    <Layout>
      <Title text="Blog" />
      {morePosts.length > 0 && <MoreStories posts={morePosts} />}
    </Layout>
  );
}
export const getStaticProps = async () => {
  const allPosts = await getAllPosts();
  return {
    props: { allPosts },
  };
};
