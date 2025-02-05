import PostPreview from "./post-preview";

const MoreStories = ({ posts }) => {
  return (
    <section>
      {posts.map((post) => (
        <PostPreview
          key={post.slug}
          title={post.title}
          publishedAt={post.publishedAt}
          slug={post.slug}
        />
      ))}
    </section>
  );
};

export default MoreStories;
