import React from 'react';
import { providerAnalytics } from '@/services/provider-analytics.service';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
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
import { DownloadIcon, ChartBarIcon, UserGroupIcon, StarIcon } from '@heroicons/react/24/outline';

export const ProviderAnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = React.useState<[Date, Date]>([
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    new Date(),
  ]);
  const [metrics, setMetrics] = React.useState<any>(null);
  const [selectedProvider, setSelectedProvider] = React.useState<string | null>(null);
  const [providerPerformance, setProviderPerformance] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);

  React.useEffect(() => {
    loadMetrics();
  }, [dateRange]);

  React.useEffect(() => {
    if (selectedProvider) {
      loadProviderPerformance();
    }
  }, [selectedProvider, dateRange]);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      const data = await providerAnalytics.getProviderMetrics(
        dateRange[0],
        dateRange[1]
      );
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load provider metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProviderPerformance = async () => {
    if (!selectedProvider) return;

    try {
      const data = await providerAnalytics.getProviderPerformance(
        selectedProvider,
        dateRange[0],
        dateRange[1]
      );
      setProviderPerformance(data);
    } catch (error) {
      console.error('Failed to load provider performance:', error);
    }
  };

  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      // Implement export functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to export report:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const renderPerformanceMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="flex items-center">
          <UserGroupIcon className="h-12 w-12 text-blue-500" />
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Active Providers</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {metrics.performance.activeProviders}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              of {metrics.performance.totalProviders} total
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <StarIcon className="h-12 w-12 text-yellow-500" />
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {metrics.performance.averageRating.toFixed(1)}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              out of 5.0
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <ChartBarIcon className="h-12 w-12 text-green-500" />
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {metrics.performance.completionRate.toFixed(1)}%
            </p>
            <p className="mt-2 text-sm text-gray-500">
              orders completed
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <ChartBarIcon className="h-12 w-12 text-purple-500" />
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Response Time</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {metrics.performance.responseTime.toFixed(0)}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              minutes average
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderRevenueMetrics = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Revenue Overview
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-semibold text-gray-900">
              ${metrics.revenue.totalRevenue.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg. Revenue per Provider</p>
            <p className="text-2xl font-semibold text-gray-900">
              ${metrics.revenue.averageRevenuePerProvider.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Top Earning Providers
        </h3>
        <div className="space-y-4">
          {metrics.revenue.topEarners.slice(0, 5).map((earner: any, index: number) => (
            <div key={earner.providerId} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-lg font-medium text-gray-900 w-6">
                  {index + 1}.
                </span>
                <span className="ml-2">{earner.name}</span>
              </div>
              <span className="font-semibold text-gray-900">
                ${earner.revenue.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderQualityMetrics = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Quality Metrics
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Satisfaction Score</p>
            <div className="flex items-center mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${metrics.quality.satisfactionScore * 20}%`
                  }}
                />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">
                {metrics.quality.satisfactionScore.toFixed(1)}/5
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Issue Resolution Rate</p>
            <div className="flex items-center mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${metrics.quality.resolutionRate}%`
                  }}
                />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">
                {metrics.quality.resolutionRate.toFixed(1)}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Provider Retention</p>
            <div className="flex items-center mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{
                    width: `${metrics.quality.retentionRate}%`
                  }}
                />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">
                {metrics.quality.retentionRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Issue Analysis
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: 'Issues', value: metrics.quality.issueRate },
                { name: 'No Issues', value: 100 - metrics.quality.issueRate }
              ]}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
            >
              <Cell fill="#ef4444" />
              <Cell fill="#22c55e" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>
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
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Select
            value={selectedProvider || ''}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="w-64"
          >
            <option value="">All Providers</option>
            {metrics?.revenue.topEarners.map((provider: any) => (
              <option key={provider.providerId} value={provider.providerId}>
                {provider.name}
              </option>
            ))}
          </Select>
        </div>
        <Button
          onClick={handleExportReport}
          disabled={isExporting}
        >
          <DownloadIcon className="h-5 w-5 mr-2" />
          {isExporting ? 'Exporting...' : 'Export Report'}
        </Button>
      </div>

      {selectedProvider && providerPerformance ? (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Provider Performance: {providerPerformance.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Orders Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {providerPerformance.metrics.ordersCompleted}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${providerPerformance.metrics.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Rating</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {providerPerformance.metrics.averageRating.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Issue Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {providerPerformance.metrics.issueRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {renderPerformanceMetrics()}
          {renderRevenueMetrics()}
          {renderQualityMetrics()}
        </div>
      )}
    </div>
  );
};
