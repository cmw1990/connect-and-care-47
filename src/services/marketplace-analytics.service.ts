import { supabase } from '@/lib/supabase/client';
import { analyticsService } from './analytics.service';

export type MarketplaceMetrics = {
  revenue: {
    total: number;
    growth: number;
    averageOrderValue: number;
    revenuePerCustomer: number;
    grossProfitMargin: number;
  };
  orders: {
    total: number;
    growth: number;
    completionRate: number;
    cancellationRate: number;
    averageProcessingTime: number;
  };
  customers: {
    total: number;
    growth: number;
    satisfaction: number;
    repeatPurchaseRate: number;
    averageAge: number;
  };
};

export type TimeSeriesData = {
  date: string;
  value: number;
};

export type CategoryData = {
  name: string;
  value: number;
};

class MarketplaceAnalyticsService {
  async getMarketplaceMetrics(startDate: Date, endDate: Date): Promise<MarketplaceMetrics> {
    const [
      revenueMetrics,
      orderMetrics,
      customerMetrics
    ] = await Promise.all([
      this.getRevenueMetrics(startDate, endDate),
      this.getOrderMetrics(startDate, endDate),
      this.getCustomerMetrics(startDate, endDate)
    ]);

    return {
      revenue: revenueMetrics,
      orders: orderMetrics,
      customers: customerMetrics
    };
  }

  private async getRevenueMetrics(startDate: Date, endDate: Date) {
    const { data: currentPeriodData, error: currentError } = await supabase
      .from('marketplace_orders')
      .select('total_amount, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (currentError) throw currentError;

    // Calculate previous period
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = new Date(endDate.getTime() - periodLength);

    const { data: previousPeriodData, error: previousError } = await supabase
      .from('marketplace_orders')
      .select('total_amount, created_at')
      .gte('created_at', previousStartDate.toISOString())
      .lte('created_at', previousEndDate.toISOString());

    if (previousError) throw previousError;

    const currentRevenue = currentPeriodData.reduce((sum, order) => sum + order.total_amount, 0);
    const previousRevenue = previousPeriodData.reduce((sum, order) => sum + order.total_amount, 0);
    const growth = previousRevenue === 0 ? 100 : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    return {
      total: currentRevenue,
      growth,
      averageOrderValue: currentPeriodData.length > 0 ? currentRevenue / currentPeriodData.length : 0,
      revenuePerCustomer: 0, // Will be calculated after getting unique customers
      grossProfitMargin: 0 // Will be calculated using cost data
    };
  }

  private async getOrderMetrics(startDate: Date, endDate: Date) {
    const { data: currentPeriodData, error: currentError } = await supabase
      .from('marketplace_orders')
      .select('id, status, created_at, completed_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (currentError) throw currentError;

    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = new Date(endDate.getTime() - periodLength);

    const { data: previousPeriodData, error: previousError } = await supabase
      .from('marketplace_orders')
      .select('id')
      .gte('created_at', previousStartDate.toISOString())
      .lte('created_at', previousEndDate.toISOString());

    if (previousError) throw previousError;

    const completedOrders = currentPeriodData.filter(order => order.status === 'completed');
    const canceledOrders = currentPeriodData.filter(order => order.status === 'canceled');
    
    const growth = previousPeriodData.length === 0 ? 100 : 
      ((currentPeriodData.length - previousPeriodData.length) / previousPeriodData.length) * 100;

    const averageProcessingTime = completedOrders.reduce((sum, order) => {
      const processTime = new Date(order.completed_at).getTime() - new Date(order.created_at).getTime();
      return sum + processTime;
    }, 0) / (completedOrders.length || 1) / (1000 * 60 * 60); // Convert to hours

    return {
      total: currentPeriodData.length,
      growth,
      completionRate: (completedOrders.length / currentPeriodData.length) * 100,
      cancellationRate: (canceledOrders.length / currentPeriodData.length) * 100,
      averageProcessingTime
    };
  }

  private async getCustomerMetrics(startDate: Date, endDate: Date) {
    const { data: currentPeriodData, error: currentError } = await supabase
      .from('marketplace_customers')
      .select('id, created_at, date_of_birth, satisfaction_score')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (currentError) throw currentError;

    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = new Date(endDate.getTime() - periodLength);

    const { data: previousPeriodData, error: previousError } = await supabase
      .from('marketplace_customers')
      .select('id')
      .gte('created_at', previousStartDate.toISOString())
      .lte('created_at', previousEndDate.toISOString());

    if (previousError) throw previousError;

    const growth = previousPeriodData.length === 0 ? 100 :
      ((currentPeriodData.length - previousPeriodData.length) / previousPeriodData.length) * 100;

    const averageAge = currentPeriodData.reduce((sum, customer) => {
      const age = new Date().getFullYear() - new Date(customer.date_of_birth).getFullYear();
      return sum + age;
    }, 0) / (currentPeriodData.length || 1);

    const averageSatisfaction = currentPeriodData.reduce((sum, customer) => 
      sum + (customer.satisfaction_score || 0), 0) / (currentPeriodData.length || 1);

    return {
      total: currentPeriodData.length,
      growth,
      satisfaction: averageSatisfaction,
      repeatPurchaseRate: 0, // Will be calculated using order history
      averageAge
    };
  }

  async getRevenueTimeSeries(
    startDate: Date,
    endDate: Date,
    interval: 'day' | 'week' | 'month' = 'day'
  ): Promise<TimeSeriesData[]> {
    const { data, error } = await supabase
      .from('marketplace_orders')
      .select('total_amount, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at');

    if (error) throw error;

    return this.aggregateTimeSeriesData(data, 'total_amount', interval);
  }

  async getOrderTimeSeries(
    startDate: Date,
    endDate: Date,
    interval: 'day' | 'week' | 'month' = 'day'
  ): Promise<TimeSeriesData[]> {
    const { data, error } = await supabase
      .from('marketplace_orders')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at');

    if (error) throw error;

    return this.aggregateTimeSeriesData(data, 'count', interval);
  }

  async getCustomerTimeSeries(
    startDate: Date,
    endDate: Date,
    interval: 'day' | 'week' | 'month' = 'day'
  ): Promise<TimeSeriesData[]> {
    const { data, error } = await supabase
      .from('marketplace_customers')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at');

    if (error) throw error;

    return this.aggregateTimeSeriesData(data, 'count', interval);
  }

  async getRevenueByCategory(): Promise<CategoryData[]> {
    const { data, error } = await supabase
      .from('marketplace_orders')
      .select('total_amount, product:products(category)')
      .order('total_amount', { ascending: false });

    if (error) throw error;

    const categoryRevenue = data.reduce((acc: Record<string, number>, order) => {
      const category = order.product?.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + order.total_amount;
      return acc;
    }, {});

    return Object.entries(categoryRevenue).map(([name, value]) => ({ name, value }));
  }

  async getOrdersByCategory(): Promise<CategoryData[]> {
    const { data, error } = await supabase
      .from('marketplace_orders')
      .select('product:products(category)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const categoryOrders = data.reduce((acc: Record<string, number>, order) => {
      const category = order.product?.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryOrders).map(([name, value]) => ({ name, value }));
  }

  async getCustomerAgeDistribution(): Promise<CategoryData[]> {
    const { data, error } = await supabase
      .from('marketplace_customers')
      .select('date_of_birth');

    if (error) throw error;

    const ageGroups = {
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55-64': 0,
      '65+': 0
    };

    data.forEach(customer => {
      const age = new Date().getFullYear() - new Date(customer.date_of_birth).getFullYear();
      if (age >= 65) ageGroups['65+']++;
      else if (age >= 55) ageGroups['55-64']++;
      else if (age >= 45) ageGroups['45-54']++;
      else if (age >= 35) ageGroups['35-44']++;
      else if (age >= 25) ageGroups['25-34']++;
      else if (age >= 18) ageGroups['18-24']++;
    });

    return Object.entries(ageGroups).map(([name, value]) => ({ name, value }));
  }

  private aggregateTimeSeriesData(
    data: any[],
    valueField: string | 'count',
    interval: 'day' | 'week' | 'month'
  ): TimeSeriesData[] {
    const aggregated: Record<string, number> = {};

    data.forEach(item => {
      let dateKey: string;
      const date = new Date(item.created_at);

      switch (interval) {
        case 'month':
          dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          dateKey = weekStart.toISOString().split('T')[0];
          break;
        default: // day
          dateKey = date.toISOString().split('T')[0];
      }

      if (valueField === 'count') {
        aggregated[dateKey] = (aggregated[dateKey] || 0) + 1;
      } else {
        aggregated[dateKey] = (aggregated[dateKey] || 0) + (item[valueField] || 0);
      }
    });

    return Object.entries(aggregated)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  trackMarketplaceEvent(event: {
    type: 'order' | 'product_view' | 'cart_action' | 'checkout' | 'review';
    action: string;
    metadata?: Record<string, any>;
  }) {
    analyticsService.trackEvent({
      category: 'marketplace',
      action: `${event.type}_${event.action}`,
      metadata: event.metadata
    });
  }

  trackMarketplaceMetric(metric: {
    name: string;
    value: number;
    unit: 'currency' | 'time' | 'count';
    metadata?: Record<string, any>;
  }) {
    analyticsService.trackMetric({
      name: `marketplace_${metric.name}`,
      value: metric.value,
      unit: metric.unit === 'currency' ? 'count' : metric.unit === 'time' ? 'ms' : 'count',
      metadata: metric.metadata
    });
  }
}

export const marketplaceAnalytics = new MarketplaceAnalyticsService();
