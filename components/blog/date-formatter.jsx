import { parseISO, format } from "date-fns";

const DateFormatter = ({
  publishedAt,
  format: dateFormat = "LLLL d, yyyy",
}) => {
  const date = parseISO(publishedAt);
  return <span>{format(date, dateFormat)}</span>;
};

export default DateFormatter;
