"use client";

import { parseISO, format } from "date-fns";

interface DateFormatterProps {
  publishedAt: string;
  format?: string;
}

const DateFormatter: React.FC<DateFormatterProps> = ({
  publishedAt,
  format: dateFormat = "LLLL d, yyyy",
}) => {
  const date = parseISO(publishedAt);
  return <span className="text-neutral-500">{format(date, dateFormat)}</span>;
};

export default DateFormatter;
