import React from 'react';
import { marketplaceService } from '@/services/marketplace.service';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = React.useState('7d');
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const data = await marketplaceService.getAnalytics(timeRange);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !analytics) {
    return <div>Loading analytics...</div>;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Marketplace Analytics
        </h2>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="w-40"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ${analytics.totalRevenue.toFixed(2)}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {analytics.revenueGrowth > 0 ? '+' : ''}
            {analytics.revenueGrowth}% from previous period
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {analytics.totalOrders}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {analytics.orderGrowth > 0 ? '+' : ''}
            {analytics.orderGrowth}% from previous period
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Average Order Value
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ${analytics.averageOrderValue.toFixed(2)}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Customer Satisfaction
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {analytics.customerSatisfaction}%
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Revenue Over Time
          </h3>
          <LineChart
            width={500}
            height={300}
            data={analytics.revenueOverTime}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Categories
          </h3>
          <PieChart width={500} height={300}>
            <Pie
              data={analytics.categoryDistribution}
              cx={250}
              cy={150}
              innerRadius={60}
              outerRadius={120}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label
            >
              {analytics.categoryDistribution.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Orders by Status
          </h3>
          <BarChart
            width={500}
            height={300}
            data={analytics.ordersByStatus}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Products
          </h3>
          <BarChart
            width={500}
            height={300}
            data={analytics.topProducts}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#82ca9d" />
          </BarChart>
        </Card>
      </div>
    </div>
  );
};
