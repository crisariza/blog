"use client";

import Title from "@/components/title";
import Link from "next/link";
import { motion } from "framer-motion";
import { TimeLineProps } from "@/types";

export default function TimeLine({ data, title }: TimeLineProps) {
  return (
    <div>
      <Title text={title} size="small" />
      <div className="mx-auto space-y-8">
        {data.map((experience, index) => (
          <motion.div
            key={`${experience.company.text}-${experience.period}`}
            className="border-b border-neutral-700 pb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ x: 4 }}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-neutral-200 text-xl font-medium">
                {experience.company.href ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={experience.company.href}
                      className="hover:text-neutral-400 flex items-center gap-1"
                      target="_blank"
                    >
                      {experience.company.text}
                      <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="inline-block"
                        whileHover={{ rotate: 45 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </motion.svg>
                    </Link>
                  </motion.div>
                ) : (
                  experience.company.text
                )}
              </h3>
              <span className="text-neutral-400">{experience.period}</span>
            </div>
            <p className="text-neutral-400 mt-1">{experience.role}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
