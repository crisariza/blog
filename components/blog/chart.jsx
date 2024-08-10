import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

const Chart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 14, left: -14 }}>
        <Line type="monotone" dataKey="amount" stroke="white" />
        <CartesianGrid stroke="#ccc" strokeDasharray="3" />
        <XAxis dataKey="month" />
        <YAxis unit={"$"} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Chart;
