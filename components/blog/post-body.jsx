import ReactMarkdown from "react-markdown";

const PostBody = ({ body }) => {
  return (
    <div className="prose prose-invert lg:prose-xl max-w-fit">
      <ReactMarkdown>{body}</ReactMarkdown>
    </div>
  );
};

export default PostBody;
