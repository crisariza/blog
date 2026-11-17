"use client";

import { motion } from "framer-motion";
import { TitleProps } from "@/types";

export default function Title({ text, eyebrow }: TitleProps) {
  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
      <h1 className="heading-hand">{text}</h1>
    </motion.div>
  );
}
