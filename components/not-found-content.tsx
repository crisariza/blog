"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFoundContent() {
  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        Not found
      </motion.h1>
      <motion.p
        className="text-neutral-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.12 }}
      >
        This page doesn&apos;t exist or the link is wrong.
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.2 }}
      >
        <Link href="/" className="link-inline">
          Back home
        </Link>
      </motion.div>
    </motion.div>
  );
}
