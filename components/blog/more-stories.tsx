import PostPreview from "@/components/blog/post-preview";
import { Post } from "@/lib/types";

interface MoreStoriesProps {
  posts: Post[];
}

export default function MoreStories({ posts }: MoreStoriesProps) {
  let currentYear: number | null = null;

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
}
