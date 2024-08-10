import DateFormatter from "./date-formatter";
import CoverImage from "./cover-image";
import Link from "next/link";

const PostPreview = ({ title, mainImage, publishedAt, slug }) => {
  return (
    <div className="md:flex md:justify-between mb-8 w-128">
      <div className="w-1/2">
        <h3 className="text-2xl mb-2 font-bold">
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
      <div className="w-64 h-40">
        <CoverImage slug={slug} title={title} src={mainImage} />
      </div>
    </div>
  );
};

export default PostPreview;
