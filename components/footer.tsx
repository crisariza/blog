"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const EMAIL = "mecrisariza@gmail.com";
const BOOKING_URL = "https://cal.com/crisariza/intro";
const CURRENT_YEAR = new Date().getFullYear();

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/crisariza" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/crisariza" },
  { label: "X", href: "https://x.com/crisarizx" },
];

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden
    >
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

export default function Footer() {
  return (
    <motion.footer
      className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.06] bg-gradient-to-br from-[#1b1b22] via-[#16161c] to-[#121620] p-6 sm:p-10"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
    >
      <figure className="flex gap-4">
        <span
          aria-hidden
          className="font-hand text-5xl leading-none text-amber-700/80"
        >
          “
        </span>
        <div>
          <blockquote className="font-hand text-xl leading-relaxed text-neutral-100 sm:text-2xl">
            “Make it work, make it right, make it fast.”
          </blockquote>
          <figcaption className="mt-3 flex items-center gap-3 font-hand text-sm text-neutral-400">
            — Kent Beck
            <span
              aria-hidden
              className="h-1.5 w-16 rounded-full bg-amber-700/60"
            />
          </figcaption>
        </div>
      </figure>

      <div className="mt-14 flex flex-col gap-6">
        <div>
          <p className="eyebrow">Get in touch · Collaboration</p>
          <h2 className="mt-2 font-hand text-3xl text-neutral-100 sm:text-4xl">
            let&apos;s build something great.
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-neutral-300">
            Open to remote senior and founding engineer roles, product work and
            conversations about AI agents. Drop a line or book a quick intro
            chat.
          </p>
        </div>
        <div className="flex flex-col gap-3 min-[520px]:flex-row">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-neutral-100 px-5 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-white"
          >
            <CalendarIcon />
            Book a 30m call
            <span aria-hidden>↗</span>
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/10 px-5 py-3 text-sm text-neutral-200 transition-colors hover:border-white/25 hover:text-white"
          >
            <span className="text-rose-400">
              <MailIcon />
            </span>
            {EMAIL}
          </a>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-3">
        <span className="font-hand text-sm text-neutral-500">
          find me online ➔
        </span>
        {SOCIALS.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/[0.06] bg-black/20 px-4 py-2 font-mono text-xs text-neutral-300 transition-colors hover:border-white/20 hover:text-white"
          >
            {social.label} <span aria-hidden>↗</span>
          </a>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-neutral-500">
        <p>
          <Link href="/" className="font-hand text-sm text-neutral-300">
            cris ariza
          </Link>{" "}
          · © {CURRENT_YEAR} · crafted with code &amp; agents
        </p>
        <button
          type="button"
          onClick={scrollToTop}
          className="rounded-full border border-white/10 px-4 py-2 text-neutral-400 transition-colors hover:border-white/25 hover:text-neutral-100"
        >
          back to top ↑
        </button>
      </div>
    </motion.footer>
  );
}
