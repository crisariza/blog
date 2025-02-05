import DateFormatter from "./date-formatter";
import PostTitle from "./post-title";

const PostHeader = ({ title, publishedAt }) => {
  return (
    <div className="mb-8">
      <PostTitle>{title}</PostTitle>
      <div className="mb-6 text-lg text-gray-400">
        <DateFormatter publishedAt={publishedAt} />
      </div>
    </div>
  );
};

export default PostHeader;
