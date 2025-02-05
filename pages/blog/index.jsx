import Layout from "../../components/layout";
import MoreStories from "../../components/blog/more-stories";
import { getAllPosts } from "../../lib/api";

export default function Blog({ allPosts }) {
  const morePosts = allPosts;

  return (
    <Layout>{morePosts.length > 0 && <MoreStories posts={morePosts} />}</Layout>
  );
}
export const getStaticProps = async () => {
  const allPosts = await getAllPosts();
  return {
    props: { allPosts },
  };
};
