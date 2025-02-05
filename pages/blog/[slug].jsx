import { useRouter } from "next/router";
import { getPostBySlug, getAllPosts } from "../../lib/api";
import Layout from "../../components/layout";
import PostBody from "../../components/blog/post-body";
import PostHeader from "../../components/blog/post-header";

export default function Post({ post }) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Cargando...</div>;
  }

  return (
    <Layout title={post ? `${post.title}` : ""}>
      {router.isFallback ? (
        <PostTitle>Loading…</PostTitle>
      ) : (
        <>
          <article>
            <PostHeader title={post.title} publishedAt={post.publishedAt} />
            <PostBody body={post.body} />
          </article>
        </>
      )}
    </Layout>
  );
}

export async function getStaticPaths() {
  const allPosts = await getAllPosts();
  const paths = allPosts.map((post) => ({
    params: { slug: post.slug },
  }));
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const post = await getPostBySlug({ slug });

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
  };
}
