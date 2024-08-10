import DateFormatter from "./date-formatter";
import CoverImage from "./cover-image";
import PostTitle from "./post-title";

const PostHeader = ({ title, mainImage, publishedAt }) => {
  return (
    <div className="mb-8">
      <PostTitle>{title}</PostTitle>
      <div className="mb-6 text-lg text-gray-400">
        <DateFormatter publishedAt={publishedAt} />
      </div>
      <div className="w-64 md:w-96 m-auto">
        <CoverImage title={title} src={mainImage} />
      </div>
    </div>
  );
};

export default PostHeader;
