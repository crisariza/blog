"use client";

import ReactMarkdown from "react-markdown";
import { PostBodyProps } from "@/types";

export default function PostBody({ body }: PostBodyProps) {
  return (
    <div className="prose max-w-fit prose-invert text-neutral-400">
      <ReactMarkdown>{body}</ReactMarkdown>
    </div>
  );
}
