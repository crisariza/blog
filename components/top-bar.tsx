"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  { href: "/about", label: "about" },
  { href: "/resume", label: "resume", external: true },
];

/** The bar turns into a floating pill after this much scroll */
const FLOAT_AFTER_PX = 24;
const CLOCK_REFRESH_MS = 20_000;
const TIME_ZONE = "America/Argentina/Buenos_Aires";
const TIME_ZONE_LABEL = "GMT-3";

const FLOATING_STYLE = {
  paddingLeft: 24,
  paddingRight: 12,
  paddingTop: 10,
  paddingBottom: 10,
  borderRadius: 999,
  borderColor: "rgba(255,255,255,0.1)",
  backgroundColor: "rgba(30,30,37,0.85)",
  boxShadow: "0 12px 30px -12px rgba(0,0,0,0.6)",
};

const RESTING_STYLE = {
  paddingLeft: 12,
  paddingRight: 12,
  paddingTop: 8,
  paddingBottom: 8,
  borderRadius: 999,
  borderColor: "rgba(255,255,255,0)",
  backgroundColor: "rgba(16,16,23,0)",
  boxShadow: "0 0 0 0 rgba(0,0,0,0)",
};

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
});

const isActive = (pathname: string, href: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);

function useLocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTime(timeFormatter.format(new Date()));
    update();
    const interval = window.setInterval(update, CLOCK_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, []);

  return time;
}

function useIsScrolled() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > FLOAT_AFTER_PX);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isScrolled;
}

function LocalClock() {
  const time = useLocalTime();

  return (
    <span
      className="flex items-center gap-2 font-mono text-xs text-neutral-300"
      aria-label={time ? `Local time ${time} ${TIME_ZONE_LABEL}` : undefined}
    >
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className="tabular-nums">{time ?? "--:--"}</span>
      <span className="text-neutral-500">{TIME_ZONE_LABEL}</span>
    </span>
  );
}

export default function TopBar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useIsScrolled();

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  const linkClassName = (href: string) =>
    cn("link-nav", isActive(pathname, href) && "link-nav-active");

  return (
    <header className="sticky top-3 z-40 -mx-3 sm:-mx-6">
      <motion.div
        className="relative flex items-center justify-between border"
        initial={false}
        animate={isScrolled ? FLOATING_STYLE : RESTING_STYLE}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        style={{ backdropFilter: isScrolled ? "blur(12px)" : "none" }}
      >
        <nav className="hidden items-center gap-5 min-[420px]:flex">
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
          <LocalClock />
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
      </motion.div>
    </header>
  );
}
