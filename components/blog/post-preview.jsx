import DateFormatter from "./date-formatter";
import CoverImage from "./cover-image";
import Link from "next/link";

const PostPreview = ({ title, mainImage, publishedAt, slug }) => {
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
      <div className="mt-2 sm:mt-0 w-40 h-28">
        <CoverImage slug={slug} title={title} src={mainImage} />
      </div>
    </div>
  );
};

export default PostPreview;
