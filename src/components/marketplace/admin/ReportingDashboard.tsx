import React from 'react';
import { marketplaceService } from '@/services/marketplace.service';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
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
  ResponsiveContainer,
} from 'recharts';
import { DownloadIcon } from '@heroicons/react/24/outline';

export const ReportingDashboard: React.FC = () => {
  const [dateRange, setDateRange] = React.useState<[Date, Date]>([
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    new Date(),
  ]);
  const [reportType, setReportType] = React.useState('revenue');
  const [reportData, setReportData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);

  React.useEffect(() => {
    loadReportData();
  }, [dateRange, reportType]);

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      const data = await marketplaceService.getReportData(
        reportType,
        dateRange[0],
        dateRange[1]
      );
      setReportData(data);
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      await marketplaceService.exportReport(
        reportType,
        dateRange[0],
        dateRange[1]
      );
    } catch (error) {
      console.error('Failed to export report:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const renderRevenueReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ${reportData.totalRevenue.toFixed(2)}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {reportData.revenueGrowth > 0 ? '+' : ''}
            {reportData.revenueGrowth}% from previous period
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Average Order Value
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ${reportData.averageOrderValue.toFixed(2)}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {reportData.aovGrowth > 0 ? '+' : ''}
            {reportData.aovGrowth}% from previous period
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Gross Profit Margin
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {reportData.grossProfitMargin}%
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Revenue per Customer
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ${reportData.revenuePerCustomer.toFixed(2)}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Revenue Over Time
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={reportData.revenueOverTime}>
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
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Revenue by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData.revenueByCategory}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {reportData.revenueByCategory.map((entry: any, index: number) => (
                  <Cell key={index} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Products by Revenue
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );

  const renderOrdersReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {reportData.totalOrders}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {reportData.orderGrowth > 0 ? '+' : ''}
            {reportData.orderGrowth}% from previous period
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Order Completion Rate
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {reportData.completionRate}%
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Average Processing Time
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {reportData.avgProcessingTime} hours
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Cancellation Rate
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {reportData.cancellationRate}%
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Orders Over Time
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={reportData.ordersOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#82ca9d"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Orders by Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData.ordersByStatus}
                dataKey="value"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {reportData.ordersByStatus.map((entry: any, index: number) => (
                  <Cell key={index} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Orders by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.ordersByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );

  const renderCustomerReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {reportData.totalCustomers}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {reportData.customerGrowth > 0 ? '+' : ''}
            {reportData.customerGrowth}% from previous period
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Customer Satisfaction
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {reportData.customerSatisfaction}%
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Repeat Purchase Rate
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {reportData.repeatPurchaseRate}%
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Average Customer Age
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {reportData.avgCustomerAge} years
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Customer Growth Over Time
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={reportData.customerGrowthOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="customers"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Customer Age Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.customerAgeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Customer Segments
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData.customerSegments}
                dataKey="value"
                nameKey="segment"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {reportData.customerSegments.map((entry: any, index: number) => (
                  <Cell key={index} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-40"
          >
            <option value="revenue">Revenue</option>
            <option value="orders">Orders</option>
            <option value="customers">Customers</option>
          </Select>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
        </div>
        <Button
          onClick={handleExportReport}
          disabled={isExporting}
        >
          <DownloadIcon className="h-5 w-5 mr-2" />
          {isExporting ? 'Exporting...' : 'Export Report'}
        </Button>
      </div>

      {reportType === 'revenue' && renderRevenueReport()}
      {reportType === 'orders' && renderOrdersReport()}
      {reportType === 'customers' && renderCustomerReport()}
    </div>
  );
};
