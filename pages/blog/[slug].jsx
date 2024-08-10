import { useRouter } from "next/router";
import ErrorPage from "next/error";
import PostBody from "../../components/blog/post-body";
import PostHeader from "../../components/blog/post-header";
import { getPostBySlug, getAllPosts } from "../../lib/api";
import PostTitle from "../../components/blog/post-title";
import Head from "next/head";
import SideBar from "../../components/sideBar";
import Footer from "../../components/footer";

export default function Post({ post, preview }) {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <div className="max-w-screen-md m-6 sm:m-auto sm:p-0 sm:mt-20">
      <div className="sm:flex sm:justify-center">
        <SideBar></SideBar>{" "}
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article className="mb-8">
              <Head>
                <title>{post.title} | Cristian Ariza</title>
              </Head>
              <PostHeader
                title={post.title}
                mainImage={post.mainImage}
                publishedAt={post.publishedAt}
              />
              <PostBody body={post.body} />
            </article>
          </>
        )}
      </div>
      <Footer></Footer>
    </div>
  );
}

export const getStaticProps = async (context) => {
  const { slug } = context.params;
  const post = await getPostBySlug(slug, ["slug", "content"]);

  return {
    props: {
      post,
    },
  };
};

export async function getStaticPaths() {
  const allPosts = await getAllPosts(["slug", "content"]);
  return {
    paths: allPosts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: true,
  };
}
