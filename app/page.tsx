"use client";

import TimeLine from "@/components/timeline";
import { motion } from "framer-motion";
import { TimeLineItem } from "@/types";

export default function Home() {
  const experiences: TimeLineItem[] = [
    {
      company: { text: "Paisanos", href: "https://clublanus.com" },
      role: "Product Engineer",
      period: "2026 - Present",
    },
    {
      company: { text: "Accenture" },
      role: "Software Engineer",
      period: "2021 - 2026",
    },
  ];

  const projects: TimeLineItem[] = [
    {
      company: {
        href: "https://museogranate.clublanus.com",
        text: "Museo Granate",
      },
      role: "Product Engineer",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <TimeLine data={experiences} title="Experience" />
      <br />
      <TimeLine data={projects} title="Projects" />
    </motion.div>
  );
}
