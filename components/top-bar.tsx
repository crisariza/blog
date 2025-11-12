"use client";

import Link from "next/link";
import { useState } from "react";

import { usePathname } from "next/navigation";

export default function TopBar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const linkClassName = (path: string) => {
    return pathname === path
      ? "font-semibold"
      : "hover:underline hover:decoration-gray-600 hover:underline-offset-4";
  };

  return (
    <div className="flex justify-between items-center relative">
      <h1 className="text-neutral-50 text-xl">
        <Link href="/">Cristian Ariza</Link>
      </h1>
      {/* Desktop Navigation */}
      <div className="hidden min-[350px]:flex items-center gap-6 text-neutral-300">
        <Link href="/about" className={linkClassName("/about")}>
          About
        </Link>
        <Link href="/blog" className={linkClassName("/blog")}>
          Blog
        </Link>
        <Link
          target="_blank"
          href="/Cristian Ariza - Resume.pdf"
          className={linkClassName("/Cristian Ariza - Resume.pdf")}
        >
          Resume
        </Link>
      </div>
      {/* Hamburger Menu Button */}
      <button
        onClick={toggleMenu}
        className="min-[350px]:hidden flex flex-col gap-1.5 text-neutral-300 focus:outline-none"
        aria-label="Toggle menu"
      >
        <span
          className={`block h-0.5 w-6 bg-current transition-all ${
            isMenuOpen ? "rotate-45 translate-y-2" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-current transition-all ${
            isMenuOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-current transition-all ${
            isMenuOpen ? "-rotate-45 -translate-y-2" : ""
          }`}
        />
      </button>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full right-0 mt-4 min-[350px]:hidden bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg py-2 min-w-[150px]">
          <Link
            href="/about"
            onClick={toggleMenu}
            className={`block px-4 py-2 text-neutral-300 ${linkClassName(
              "/about"
            )}`}
          >
            About
          </Link>
          <Link
            href="/blog"
            onClick={toggleMenu}
            className={`block px-4 py-2 text-neutral-300 ${linkClassName(
              "/blog"
            )}`}
          >
            Blog
          </Link>
          <Link
            target="_blank"
            href="/Cristian Ariza - Resume.pdf"
            onClick={toggleMenu}
            className={`block px-4 py-2 text-neutral-300 ${linkClassName(
              "/Cristian Ariza - Resume.pdf"
            )}`}
          >
            Resume
          </Link>
        </div>
      )}
    </div>
  );
}
