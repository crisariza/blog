"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import youngCris from "@/public/about-young-cris.webp";
import Title from "@/components/title";

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Title text="about me" eyebrow="About" />
      <motion.div
        className="mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
          <div className="flex-1 flex flex-col gap-6 order-2 md:order-1">
            <motion.p variants={itemVariants}>
              Hey! I&apos;m Cris, a software engineer originally from Lanús,
              Buenos Aires, Argentina.
            </motion.p>
            <motion.p variants={itemVariants}>
              Since I was a kid, I&apos;ve been fascinated by computers. I got
              my first one at five years old, and as I grew up, I started
              playing around with hardware and eventually writing software.
            </motion.p>
          </div>
          <motion.figure
            className="relative w-44 flex-shrink-0 order-1 md:order-2 self-center md:self-start"
            variants={itemVariants}
            whileHover={{ rotate: 0, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{ rotate: 3 }}
          >
            <span
              aria-hidden
              className="absolute -top-3 left-1/2 z-10 h-6 w-16 -translate-x-1/2 rotate-2 bg-amber-200/25"
            />
            <div className="rounded-sm bg-[#efe6d6] p-2 pb-8 shadow-elevated">
              <Image
                src={youngCris}
                alt="Cris as a kid, around the time he got his first computer"
                className="h-auto w-full"
                placeholder="blur"
                priority
              />
            </div>
            <figcaption className="absolute inset-x-0 bottom-2 text-center font-hand text-xs text-neutral-700">
              little me
            </figcaption>
          </motion.figure>
        </div>
        <div className="flex flex-col gap-6">
          <motion.p variants={itemVariants}>
            When I was 16, I started studying at the University of Buenos Aires
            while still in high school. Back then, I thought Business
            Administration was the right path for me, but after finishing high
            school, I realized I was far more interested in technology. So I
            decided to switch my major to Computer Science.
          </motion.p>
          <motion.p variants={itemVariants}>
            At 18, I dropped out and joined the coding bootcamp{" "}
            <motion.span
              whileHover={{ scale: 1.05 }}
              style={{ display: "inline-block" }}
            >
              <Link
                target="_blank"
                href="https://soyhenry.com"
                className="link-inline"
              >
                Henry
              </Link>
            </motion.span>
            . Just three weeks later, I landed my first job as a software
            engineer at{" "}
            <motion.span
              whileHover={{ scale: 1.05 }}
              style={{ display: "inline-block" }}
            >
              <Link
                target="_blank"
                href="https://accenture.com"
                className="link-inline"
              >
                Accenture
              </Link>
            </motion.span>
            , where I&apos;ve been working until 2026 when I joined Paisanos.
          </motion.p>
          <motion.p variants={itemVariants}>
            Since then, I&apos;ve worked on a wide range of projects, from small
            startups to large-scale enterprise systems. Every project has taught
            me something new, and I&apos;m still learning every single day.
          </motion.p>
          <motion.p variants={itemVariants}>
            In 2024, I met Club Lanús president Luis Chebel and began
            collaborating with the club on its digital transformation
            initiatives. Some of the projects I&apos;ve built include{" "}
            <motion.span
              whileHover={{ scale: 1.05 }}
              style={{ display: "inline-block" }}
            >
              <Link
                target="_blank"
                href="https://museogranate.com"
                className="link-inline"
              >
                Museo Granate
              </Link>
            </motion.span>
            , the{" "}
            <motion.span
              whileHover={{ scale: 1.05 }}
              style={{ display: "inline-block" }}
            >
              <Link
                target="_blank"
                href="https://clublanus.help.center/"
                className="link-inline"
              >
                Club Lanús Help Center
              </Link>
            </motion.span>
            , and the{" "}
            <motion.span
              whileHover={{ scale: 1.05 }}
              style={{ display: "inline-block" }}
            >
              <Link
                target="_blank"
                href="https://api.whatsapp.com/send/?phone=%2B5491128420065&text&type=phone_number&app_absent=0"
                className="link-inline"
              >
                WhatsApp chatbot
              </Link>
            </motion.span>
            , which handles over 10,000 messages per month and helps fans with
            their questions.
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
