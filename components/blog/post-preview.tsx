"use client";

import React from "react";
import DateFormatter from "@/components/blog/date-formatter";
import Link from "next/link";
import { motion } from "framer-motion";
import { PostPreviewProps } from "@/types";

const PostPreview: React.FC<PostPreviewProps> = ({
  title,
  publishedAt,
  slug,
  showYear,
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ x: 4 }}
    >
      <Link
        href={`/blog/${slug}`}
        className="block text-neutral-200 hover:bg-neutral-800 transition-colors"
      >
        <div className="flex items-center justify-between py-4 border-b border-neutral-700">
          <div className="flex items-center gap-4 md:gap-8">
            <motion.div
              className="w-16 shrink-0 text-neutral-600"
              whileHover={{ scale: 1.1 }}
            >
              {showYear && (
                <DateFormatter publishedAt={publishedAt} format="yyyy" />
              )}
            </motion.div>
            <div className="flex-1 min-w-0">{title}</div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PostPreview;
