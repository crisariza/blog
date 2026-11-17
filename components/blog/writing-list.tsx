import Link from "next/link";
import { WritingListProps } from "@/types";

const yearOf = (date: string) => new Date(date).getFullYear();

export default function WritingList({ posts }: WritingListProps) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            href={`/blog/${post.slug}`}
            className="-mx-2 flex items-baseline justify-between gap-4 rounded-surface border-b border-line px-2 py-3 font-mono text-sm text-neutral-200 transition-colors hover:bg-surface-hover"
          >
            <span>{post.title}</span>
            <span className="shrink-0 text-xs text-neutral-500">
              {yearOf(post.publishedAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
