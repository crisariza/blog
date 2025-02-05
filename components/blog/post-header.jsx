import DateFormatter from "./date-formatter";
import PostTitle from "./post-title";

export default function PostHeader({ title, publishedAt }) {
  return (
    <div className="mb-6">
      <div className="mb-4">
        {" "}
        <PostTitle>{title}</PostTitle>
        <DateFormatter publishedAt={publishedAt} />
      </div>
    </div>
  );
}
