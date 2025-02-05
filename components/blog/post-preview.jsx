import DateFormatter from "./date-formatter";
import Link from "next/link";

const PostPreview = ({ title, publishedAt, slug }) => {
  return (
    <div className="flex justify-between mb-8 w-128">
      <div className="sm:w-1/2">
        <h3 className="text-2xl mb-2 font-semibold">
          <Link
            as={`/blog/${slug}`}
            href="/blog/[slug]"
            className="hover:underline"
          >
            {title}
          </Link>
        </h3>
        <div className="text-lg text-gray-400">
          <DateFormatter publishedAt={publishedAt} />
        </div>
      </div>
    </div>
  );
};

export default PostPreview;
