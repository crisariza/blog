"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
        Something went wrong
      </motion.h1>
      <motion.p
        className="text-neutral-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.12 }}
      >
        An unexpected error occurred. You can try again or return home.
      </motion.p>
      <motion.div
        className="flex flex-wrap gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.2 }}
      >
        <button
          type="button"
          onClick={reset}
          className="rounded-surface px-3 py-1.5 text-sm font-medium text-neutral-200 ring-1 ring-line hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          Try again
        </button>
        <Link href="/" className="link-inline self-center text-sm">
          Back home
        </Link>
      </motion.div>
    </motion.div>
  );
}
