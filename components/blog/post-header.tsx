"use client";

import DateFormatter from "@/components/blog/date-formatter";
import { motion } from "framer-motion";
import { PostHeaderProps } from "@/types";

export default function PostHeader({ title, publishedAt }: PostHeaderProps) {
  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-200 mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {title}
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <DateFormatter publishedAt={publishedAt} />
      </motion.div>
    </motion.div>
  );
}
