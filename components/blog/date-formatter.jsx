"use client";

import { parseISO, format } from "date-fns";

const DateFormatter = ({
  publishedAt,
  format: dateFormat = "LLLL d, yyyy",
}) => {
  const date = parseISO(publishedAt);
  return <span className="text-neutral-500">{format(date, dateFormat)}</span>;
};

export default DateFormatter;
