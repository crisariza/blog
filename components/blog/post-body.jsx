import ReactMarkdown from "react-markdown";

export default function PostBody({ body }) {
  return (
    <div className="prose max-w-fit prose-invert text-neutral-400">
      <ReactMarkdown>{body}</ReactMarkdown>
    </div>
  );
}
