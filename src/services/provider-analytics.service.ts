import { supabase } from '@/lib/supabase/client';
import { analyticsService } from './analytics.service';

export type ProviderMetrics = {
  performance: {
    totalProviders: number;
    activeProviders: number;
    averageRating: number;
    completionRate: number;
    responseTime: number;
  };
  revenue: {
    totalRevenue: number;
    averageRevenuePerProvider: number;
    topEarners: Array<{
      providerId: string;
      name: string;
      revenue: number;
    }>;
  };
  quality: {
    satisfactionScore: number;
    issueRate: number;
    resolutionRate: number;
    retentionRate: number;
  };
};

export type ProviderPerformanceData = {
  providerId: string;
  name: string;
  metrics: {
    ordersCompleted: number;
    totalRevenue: number;
    averageRating: number;
    responseTime: number;
    issueRate: number;
  };
};

class ProviderAnalyticsService {
  async getProviderMetrics(startDate: Date, endDate: Date): Promise<ProviderMetrics> {
    const [performance, revenue, quality] = await Promise.all([
      this.getPerformanceMetrics(startDate, endDate),
      this.getRevenueMetrics(startDate, endDate),
      this.getQualityMetrics(startDate, endDate)
    ]);

    return {
      performance,
      revenue,
      quality
    };
  }

  private async getPerformanceMetrics(startDate: Date, endDate: Date) {
    const { data: providers, error: providersError } = await supabase
      .from('marketplace_providers')
      .select('id, status, created_at');

    if (providersError) throw providersError;

    const { data: orders, error: ordersError } = await supabase
      .from('marketplace_orders')
      .select('provider_id, status, created_at, completed_at, rating')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (ordersError) throw ordersError;

    const activeProviders = providers.filter(p => p.status === 'active').length;
    
    const completedOrders = orders.filter(o => o.status === 'completed');
    const completionRate = orders.length > 0 
      ? (completedOrders.length / orders.length) * 100 
      : 0;

    const averageRating = completedOrders.length > 0
      ? completedOrders.reduce((sum, order) => sum + (order.rating || 0), 0) / completedOrders.length
      : 0;

    const responseTime = completedOrders.reduce((sum, order) => {
      const start = new Date(order.created_at).getTime();
      const end = new Date(order.completed_at).getTime();
      return sum + (end - start);
    }, 0) / (completedOrders.length || 1) / (1000 * 60); // Convert to minutes

    return {
      totalProviders: providers.length,
      activeProviders,
      averageRating,
      completionRate,
      responseTime
    };
  }

  private async getRevenueMetrics(startDate: Date, endDate: Date) {
    const { data: orders, error } = await supabase
      .from('marketplace_orders')
      .select(\`
        id,
        total_amount,
        provider_id,
        provider:marketplace_providers(
          id,
          name
        )
      \`)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('status', 'completed');

    if (error) throw error;

    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

    // Group revenue by provider
    const providerRevenue = orders.reduce((acc: Record<string, {
      providerId: string;
      name: string;
      revenue: number;
    }>, order) => {
      const providerId = order.provider_id;
      if (!acc[providerId]) {
        acc[providerId] = {
          providerId,
          name: order.provider?.name || 'Unknown Provider',
          revenue: 0
        };
      }
      acc[providerId].revenue += order.total_amount;
      return acc;
    }, {});

    const topEarners = Object.values(providerRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const averageRevenuePerProvider = orders.length > 0
      ? totalRevenue / Object.keys(providerRevenue).length
      : 0;

    return {
      totalRevenue,
      averageRevenuePerProvider,
      topEarners
    };
  }

  private async getQualityMetrics(startDate: Date, endDate: Date) {
    const { data: orders, error } = await supabase
      .from('marketplace_orders')
      .select(\`
        id,
        status,
        rating,
        has_issues,
        issue_resolved,
        provider_id
      \`)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    const completedOrders = orders.filter(o => o.status === 'completed');
    
    const satisfactionScore = completedOrders.length > 0
      ? completedOrders.reduce((sum, order) => sum + (order.rating || 0), 0) / completedOrders.length
      : 0;

    const ordersWithIssues = orders.filter(o => o.has_issues);
    const resolvedIssues = ordersWithIssues.filter(o => o.issue_resolved);

    const issueRate = orders.length > 0
      ? (ordersWithIssues.length / orders.length) * 100
      : 0;

    const resolutionRate = ordersWithIssues.length > 0
      ? (resolvedIssues.length / ordersWithIssues.length) * 100
      : 0;

    // Calculate provider retention rate
    const { data: providers } = await supabase
      .from('marketplace_providers')
      .select('id, created_at, last_active_at, status');

    const activeProviders = providers.filter(p => 
      p.status === 'active' && 
      new Date(p.last_active_at) >= startDate
    );

    const retentionRate = providers.length > 0
      ? (activeProviders.length / providers.length) * 100
      : 0;

    return {
      satisfactionScore,
      issueRate,
      resolutionRate,
      retentionRate
    };
  }

  async getProviderPerformance(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProviderPerformanceData> {
    const { data: provider, error: providerError } = await supabase
      .from('marketplace_providers')
      .select('id, name')
      .eq('id', providerId)
      .single();

    if (providerError) throw providerError;

    const { data: orders, error: ordersError } = await supabase
      .from('marketplace_orders')
      .select('id, status, total_amount, rating, has_issues, created_at, completed_at')
      .eq('provider_id', providerId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (ordersError) throw ordersError;

    const completedOrders = orders.filter(o => o.status === 'completed');
    const ordersWithIssues = orders.filter(o => o.has_issues);

    const metrics = {
      ordersCompleted: completedOrders.length,
      totalRevenue: completedOrders.reduce((sum, order) => sum + order.total_amount, 0),
      averageRating: completedOrders.length > 0
        ? completedOrders.reduce((sum, order) => sum + (order.rating || 0), 0) / completedOrders.length
        : 0,
      responseTime: completedOrders.reduce((sum, order) => {
        const start = new Date(order.created_at).getTime();
        const end = new Date(order.completed_at).getTime();
        return sum + (end - start);
      }, 0) / (completedOrders.length || 1) / (1000 * 60), // Convert to minutes
      issueRate: orders.length > 0
        ? (ordersWithIssues.length / orders.length) * 100
        : 0
    };

    return {
      providerId,
      name: provider.name,
      metrics
    };
  }

  async getProviderTrends(
    providerId: string,
    startDate: Date,
    endDate: Date,
    interval: 'day' | 'week' | 'month' = 'day'
  ) {
    const { data: orders, error } = await supabase
      .from('marketplace_orders')
      .select('created_at, total_amount, rating')
      .eq('provider_id', providerId)
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at');

    if (error) throw error;

    const trends: Record<string, {
      revenue: number;
      orders: number;
      rating: number;
    }> = {};

    orders.forEach(order => {
      let dateKey: string;
      const date = new Date(order.created_at);

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

      if (!trends[dateKey]) {
        trends[dateKey] = {
          revenue: 0,
          orders: 0,
          rating: 0
        };
      }

      trends[dateKey].revenue += order.total_amount;
      trends[dateKey].orders += 1;
      trends[dateKey].rating += order.rating || 0;
    });

    // Calculate averages and format data
    return Object.entries(trends).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
      averageRating: data.orders > 0 ? data.rating / data.orders : 0
    }));
  }

  trackProviderEvent(event: {
    type: 'provider_registered' | 'provider_onboarded' | 'provider_status_changed';
    providerId: string;
    metadata?: Record<string, any>;
  }) {
    analyticsService.trackEvent({
      category: 'provider',
      action: event.type,
      label: event.providerId,
      metadata: event.metadata
    });
  }

  trackProviderMetric(metric: {
    name: string;
    value: number;
    unit: 'currency' | 'time' | 'count';
    providerId: string;
    metadata?: Record<string, any>;
  }) {
    analyticsService.trackMetric({
      name: `provider_${metric.name}`,
      value: metric.value,
      unit: metric.unit === 'currency' ? 'count' : metric.unit === 'time' ? 'ms' : 'count',
      metadata: {
        ...metric.metadata,
        providerId: metric.providerId
      }
    });
  }
}

export const providerAnalytics = new ProviderAnalyticsService();
