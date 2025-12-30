"use client";

import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { PostBodyProps } from "@/types";

export default function PostBody({ body }: PostBodyProps) {
  return (
    <motion.div
      className="prose max-w-fit prose-invert text-neutral-400"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <ReactMarkdown>{body}</ReactMarkdown>
    </motion.div>
  );
}
