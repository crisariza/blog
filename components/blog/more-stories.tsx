import PostPreview from "@/components/blog/post-preview";
import { MoreStoriesProps } from "@/types";

export default function MoreStories({ posts }: MoreStoriesProps) {
  const postsWithYearInfo = posts.reduce<
    Array<{ post: (typeof posts)[0]; index: number; showYear: boolean }>
  >((acc, post, index) => {
    const year = new Date(post.publishedAt).getFullYear();
    const previousYear =
      acc.length > 0
        ? new Date(acc[acc.length - 1].post.publishedAt).getFullYear()
        : null;
    const showYear = previousYear !== year;

    acc.push({
      post,
      index,
      showYear,
    });

    return acc;
  }, []);

  return (
    <div>
      {postsWithYearInfo.map(({ post, index, showYear }) => (
        <PostPreview
          key={post.slug}
          title={post.title}
          publishedAt={post.publishedAt}
          slug={post.slug}
          showYear={showYear}
          index={index}
        />
      ))}
    </div>
  );
}
