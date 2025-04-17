"use client";

import DateFormatter from "./date-formatter";
import Link from "next/link";

const PostPreview = ({ title, publishedAt, slug, showYear }) => {
  return (
    <Link
      href={`/blog/${slug}`}
      className="block text-neutral-200 hover:bg-neutral-800 transition-colors"
    >
      <div className="flex items-center justify-between py-4 border-b border-neutral-700">
        {" "}
        <div className="flex items-center gap-8">
          {" "}
          <div className="w-16 text-neutral-600">
            {showYear && (
              <DateFormatter publishedAt={publishedAt} format="yyyy" />
            )}
          </div>
          {title}
        </div>{" "}
      </div>{" "}
    </Link>
  );
};

export default PostPreview;
