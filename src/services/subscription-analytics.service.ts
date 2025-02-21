import { supabase } from '@/lib/supabase/client';
import { analyticsService } from './analytics.service';

export type SubscriptionMetrics = {
  overview: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    monthlyRecurringRevenue: number;
    averageRevenuePerUser: number;
    churnRate: number;
  };
  growth: {
    netRevenueGrowth: number;
    customerGrowth: number;
    expansionRevenue: number;
    contractionRevenue: number;
  };
  health: {
    retentionRate: number;
    lifetimeValue: number;
    acquisitionCost: number;
    paybackPeriod: number;
  };
};

export type SubscriptionCohort = {
  cohortDate: string;
  initialCount: number;
  retentionByMonth: number[];
};

class SubscriptionAnalyticsService {
  async getSubscriptionMetrics(startDate: Date, endDate: Date): Promise<SubscriptionMetrics> {
    const [overview, growth, health] = await Promise.all([
      this.getOverviewMetrics(startDate, endDate),
      this.getGrowthMetrics(startDate, endDate),
      this.getHealthMetrics(startDate, endDate)
    ]);

    return {
      overview,
      growth,
      health
    };
  }

  private async getOverviewMetrics(startDate: Date, endDate: Date) {
    const { data: subscriptions, error } = await supabase
      .from('marketplace_subscriptions')
      .select('id, status, amount, start_date, end_date')
      .lte('start_date', endDate.toISOString())
      .gte('start_date', startDate.toISOString());

    if (error) throw error;

    const activeSubscriptions = subscriptions.filter(sub => 
      sub.status === 'active' || sub.status === 'trialing'
    );

    const monthlyRecurringRevenue = activeSubscriptions.reduce(
      (sum, sub) => sum + sub.amount,
      0
    );

    const churnedSubscriptions = subscriptions.filter(sub =>
      sub.status === 'canceled' &&
      new Date(sub.end_date) >= startDate &&
      new Date(sub.end_date) <= endDate
    );

    const churnRate = activeSubscriptions.length > 0
      ? (churnedSubscriptions.length / activeSubscriptions.length) * 100
      : 0;

    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      monthlyRecurringRevenue,
      averageRevenuePerUser: activeSubscriptions.length > 0
        ? monthlyRecurringRevenue / activeSubscriptions.length
        : 0,
      churnRate
    };
  }

  private async getGrowthMetrics(startDate: Date, endDate: Date) {
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = new Date(endDate.getTime() - periodLength);

    const [currentPeriod, previousPeriod] = await Promise.all([
      supabase
        .from('marketplace_subscriptions')
        .select('amount, status, customer_id')
        .gte('start_date', startDate.toISOString())
        .lte('start_date', endDate.toISOString()),
      supabase
        .from('marketplace_subscriptions')
        .select('amount, status, customer_id')
        .gte('start_date', previousStartDate.toISOString())
        .lte('start_date', previousEndDate.toISOString())
    ]);

    if (currentPeriod.error) throw currentPeriod.error;
    if (previousPeriod.error) throw previousPeriod.error;

    const currentRevenue = currentPeriod.data.reduce((sum, sub) => sum + sub.amount, 0);
    const previousRevenue = previousPeriod.data.reduce((sum, sub) => sum + sub.amount, 0);

    const currentCustomers = new Set(currentPeriod.data.map(sub => sub.customer_id)).size;
    const previousCustomers = new Set(previousPeriod.data.map(sub => sub.customer_id)).size;

    // Calculate expansion (upgrades) and contraction (downgrades) revenue
    const expansionRevenue = currentPeriod.data
      .filter(sub => sub.status === 'active' && sub.amount > 0)
      .reduce((sum, sub) => sum + sub.amount, 0);

    const contractionRevenue = currentPeriod.data
      .filter(sub => sub.status === 'active' && sub.amount < 0)
      .reduce((sum, sub) => sum + Math.abs(sub.amount), 0);

    return {
      netRevenueGrowth: previousRevenue === 0 ? 100 :
        ((currentRevenue - previousRevenue) / previousRevenue) * 100,
      customerGrowth: previousCustomers === 0 ? 100 :
        ((currentCustomers - previousCustomers) / previousCustomers) * 100,
      expansionRevenue,
      contractionRevenue
    };
  }

  private async getHealthMetrics(startDate: Date, endDate: Date) {
    const { data: subscriptions, error } = await supabase
      .from('marketplace_subscriptions')
      .select('id, status, amount, start_date, end_date, customer:customers(acquisition_cost)')
      .lte('start_date', endDate.toISOString())
      .gte('start_date', startDate.toISOString());

    if (error) throw error;

    const activeSubscriptions = subscriptions.filter(sub =>
      sub.status === 'active' || sub.status === 'trialing'
    );

    const retentionRate = subscriptions.length > 0
      ? (activeSubscriptions.length / subscriptions.length) * 100
      : 0;

    const averageSubscriptionLength = activeSubscriptions.reduce((sum, sub) => {
      const start = new Date(sub.start_date);
      const end = sub.end_date ? new Date(sub.end_date) : new Date();
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30); // months
    }, 0) / (activeSubscriptions.length || 1);

    const averageMonthlyRevenue = activeSubscriptions.reduce(
      (sum, sub) => sum + sub.amount,
      0
    ) / (activeSubscriptions.length || 1);

    const lifetimeValue = averageMonthlyRevenue * averageSubscriptionLength;

    const acquisitionCost = subscriptions.reduce(
      (sum, sub) => sum + (sub.customer?.acquisition_cost || 0),
      0
    ) / (subscriptions.length || 1);

    const paybackPeriod = acquisitionCost > 0
      ? acquisitionCost / averageMonthlyRevenue
      : 0;

    return {
      retentionRate,
      lifetimeValue,
      acquisitionCost,
      paybackPeriod
    };
  }

  async getCohortAnalysis(months: number = 12): Promise<SubscriptionCohort[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data: subscriptions, error } = await supabase
      .from('marketplace_subscriptions')
      .select('id, customer_id, start_date, end_date, status')
      .gte('start_date', startDate.toISOString())
      .order('start_date');

    if (error) throw error;

    const cohorts: Record<string, {
      initialCount: number;
      retentionByMonth: Record<number, number>;
    }> = {};

    // Group subscriptions by cohort (month)
    subscriptions.forEach(subscription => {
      const cohortDate = new Date(subscription.start_date)
        .toISOString()
        .slice(0, 7); // YYYY-MM format

      if (!cohorts[cohortDate]) {
        cohorts[cohortDate] = {
          initialCount: 0,
          retentionByMonth: {}
        };
      }

      // Count initial subscriptions for this cohort
      cohorts[cohortDate].initialCount++;

      // Calculate retention for each month
      const startMonth = new Date(subscription.start_date);
      const endMonth = subscription.status === 'active'
        ? new Date()
        : new Date(subscription.end_date);

      const monthDiff = (endMonth.getFullYear() - startMonth.getFullYear()) * 12 +
        (endMonth.getMonth() - startMonth.getMonth());

      for (let i = 0; i <= monthDiff; i++) {
        if (!cohorts[cohortDate].retentionByMonth[i]) {
          cohorts[cohortDate].retentionByMonth[i] = 0;
        }
        cohorts[cohortDate].retentionByMonth[i]++;
      }
    });

    // Convert to array format
    return Object.entries(cohorts)
      .map(([cohortDate, data]) => ({
        cohortDate,
        initialCount: data.initialCount,
        retentionByMonth: Array.from(
          { length: months },
          (_, i) => (data.retentionByMonth[i] || 0) / data.initialCount * 100
        )
      }))
      .sort((a, b) => a.cohortDate.localeCompare(b.cohortDate));
  }

  trackSubscriptionEvent(event: {
    type: 'subscription_created' | 'subscription_cancelled' | 'plan_changed';
    planId: string;
    metadata?: Record<string, any>;
  }) {
    analyticsService.trackEvent({
      category: 'subscription',
      action: event.type,
      label: event.planId,
      metadata: event.metadata
    });
  }

  trackSubscriptionMetric(metric: {
    name: string;
    value: number;
    unit: 'currency' | 'time' | 'count';
    metadata?: Record<string, any>;
  }) {
    analyticsService.trackMetric({
      name: `subscription_${metric.name}`,
      value: metric.value,
      unit: metric.unit === 'currency' ? 'count' : metric.unit === 'time' ? 'ms' : 'count',
      metadata: metric.metadata
    });
  }
}

export const subscriptionAnalytics = new SubscriptionAnalyticsService();
