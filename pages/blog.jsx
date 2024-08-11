import Head from "next/head";

import SideBar from "../components/side-bar";
import Footer from "../components/footer";
import MoreStories from "../components/blog/more-stories";
import { getAllPosts } from "../lib/api";

export default function Blog({ allPosts }) {
  const morePosts = allPosts;

  return (
    <div className="max-w-screen-md m-6 sm:m-auto sm:p-0 sm:mt-20">
      <Head>
        <title>Cristian Ariza - Software Engineer</title>
      </Head>
      <div className="sm:flex sm:justify-center">
        <SideBar></SideBar>{" "}
        <div> {morePosts.length > 0 && <MoreStories posts={morePosts} />}</div>
      </div>
      <Footer></Footer>
    </div>
  );
}
export const getStaticProps = async () => {
  const allPosts = await getAllPosts(["slug", "content"]);
  return {
    props: { allPosts },
  };
};
