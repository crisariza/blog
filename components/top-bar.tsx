"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import cn from "classnames";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  external?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "home" },
  { href: "/projects", label: "work" },
  { href: "/blog", label: "writings" },
  { href: "/about", label: "about" },
  { href: "/resume", label: "resume", external: true },
];

const isActive = (pathname: string, href: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);

export default function TopBar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  const linkClassName = (href: string) =>
    cn("link-nav", isActive(pathname, href) && "link-nav-active");

  return (
    <div className="relative flex items-center justify-between">
      <nav className="hidden items-center gap-4 min-[420px]:flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            className={linkClassName(item.href)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Link
        href="/"
        className="font-hand text-lg text-neutral-100 min-[420px]:hidden"
      >
        cris
      </Link>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 font-mono text-xs text-neutral-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
          open to work
        </span>
        <motion.button
          onClick={toggleMenu}
          className="flex flex-col gap-1.5 rounded-surface text-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface min-[420px]:hidden"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            className="block h-0.5 w-5 bg-current"
            animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 6 : 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block h-0.5 w-5 bg-current"
            animate={{ opacity: isMenuOpen ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block h-0.5 w-5 bg-current"
            animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -6 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </motion.button>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            className="absolute right-0 top-full z-50 mt-4 min-w-[150px] rounded-surface border border-line-muted bg-surface-raised py-2 shadow-elevated min-[420px]:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                onClick={toggleMenu}
                className={`block px-4 py-2 ${linkClassName(item.href)}`}
              >
                {item.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
