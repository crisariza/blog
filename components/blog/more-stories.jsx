import PostPreview from "./post-preview";

const MoreStories = ({ posts }) => {
  let currentYear = null;

  return (
    <div>
      {posts.map((post) => {
        const year = new Date(post.publishedAt).getFullYear();
        const showYear = currentYear !== year;
        currentYear = year;

        return (
          <PostPreview
            key={post.slug}
            title={post.title}
            publishedAt={post.publishedAt}
            slug={post.slug}
            showYear={showYear}
          />
        );
      })}
    </div>
  );
};

export default MoreStories;
