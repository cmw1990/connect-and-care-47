
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdherenceChartProps {
  data: Array<{
    date: string;
    adherence_rate: number;
    total_doses: number;
    taken_doses: number;
  }>;
}

export const AdherenceChart = ({ data }: AdherenceChartProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const chartData = data.map(item => ({
    ...item,
    date: formatDate(item.date),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medication Adherence Trends</CardTitle>
        <CardDescription>
          30-day medication adherence history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={(value) => value}
              />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="adherence_rate"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                name="Adherence Rate"
                unit="%"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
