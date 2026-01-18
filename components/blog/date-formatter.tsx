"use client";

import React from "react";
import { parseISO, format } from "date-fns";
import { DateFormatterProps } from "@/types";

const DateFormatter: React.FC<DateFormatterProps> = ({
  publishedAt,
  format: dateFormat = "LLLL d, yyyy",
}) => {
  const date = parseISO(publishedAt);
  return <span className="text-neutral-500">{format(date, dateFormat)}</span>;
};

export default DateFormatter;
