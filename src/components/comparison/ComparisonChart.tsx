import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ComparisonResult } from "./types";

interface ComparisonChartProps {
  data: Record<string, ComparisonResult>;
}

export const ComparisonChart = ({ data }: ComparisonChartProps) => {
  const chartData = Object.entries(data).map(([id, item]) => ({
    name: item.name,
    rating: item.averageRating
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="rating" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};