"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

export default function TopBar() {
  const pathname = usePathname();

  return (
    <div className="flex justify-between">
      <h1 className="text-neutral-50 text-xl font-medium">
        <Link href="/">Cristian Ariza</Link>
      </h1>
      <div className="flex items-center gap-6 text-neutral-200">
        <Link
          href="/about"
          className={
            pathname === "/about"
              ? "font-semibold"
              : "hover:underline hover:decoration-gray-600 hover:underline-offset-4"
          }
        >
          About
        </Link>
        <Link
          href="/blog"
          className={
            pathname === "/blog"
              ? "font-semibold"
              : "hover:underline hover:decoration-gray-600 hover:underline-offset-4"
          }
        >
          Blog
        </Link>
        <Link
          target="_blank"
          href="/Cristian Ariza - Resume.pdf"
          className={
            pathname === "/Cristian Ariza - Resume.pdf"
              ? "font-semibold"
              : "hover:underline hover:decoration-gray-600 hover:underline-offset-4"
          }
        >
          Resume
        </Link>
      </div>
    </div>
  );
}
