"use client";

import { motion } from "framer-motion";
import { TitleProps } from "@/types";

export default function Title({ text, size }: TitleProps) {
  return (
    <motion.h1
      className={`${
        size === "small"
          ? "text-md md:text-lg text-neutral-300"
          : "text-lg md:text-xl text-neutral-200"
      } font-semibold md:leading-none mb-6 text-left`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {text}
    </motion.h1>
  );
}
