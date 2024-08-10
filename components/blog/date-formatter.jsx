import { parseISO, format } from "date-fns";

const DateFormatter = ({ publishedAt }) => {
  const date = parseISO(publishedAt);
  return <p>{format(date, "LLLL	d, yyyy")}</p>;
};

export default DateFormatter;
