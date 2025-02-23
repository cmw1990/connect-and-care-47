
import { supabase } from '@/lib/supabase/client';

export interface ProviderAnalytics {
  revenue: {
    total: number;
    monthly: number[];
    growth: number;
  };
  customers: {
    total: number;
    active: number;
    new: number;
    retention: number;
  };
  services: {
    total: number;
    popular: Array<{
      id: string;
      name: string;
      bookings: number;
    }>;
  };
  ratings: {
    average: number;
    total: number;
    distribution: number[];
  };
}

class ProviderAnalyticsService {
  async getAnalytics(providerId: string): Promise<ProviderAnalytics> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const { data: revenue } = await supabase
      .from('marketplace_orders')
      .select('amount, created_at')
      .eq('provider_id', providerId)
      .gte('created_at', lastMonth.toISOString());

    const { data: customers } = await supabase
      .from('marketplace_orders')
      .select('customer_id')
      .eq('provider_id', providerId)
      .gte('created_at', lastMonth.toISOString());

    const { data: services } = await supabase
      .from('marketplace_services')
      .select(`
        id,
        name,
        bookings:marketplace_orders(count)
      `)
      .eq('provider_id', providerId);

    const { data: ratings } = await supabase
      .from('marketplace_reviews')
      .select('rating')
      .eq('provider_id', providerId);

    // Calculate revenue metrics
    const totalRevenue = revenue?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
    const monthlyRevenue = Array(12).fill(0);
    revenue?.forEach(order => {
      const date = new Date(order.created_at);
      monthlyRevenue[date.getMonth()] += order.amount || 0;
    });

    // Calculate customer metrics
    const uniqueCustomers = new Set(customers?.map(c => c.customer_id));
    const activeCustomers = customers?.filter(c => 
      new Date(c.created_at) >= startOfMonth
    ).length || 0;

    // Calculate service metrics
    const sortedServices = services?.sort((a, b) => 
      (b.bookings?.length || 0) - (a.bookings?.length || 0)
    ).slice(0, 5);

    // Calculate rating metrics
    const ratingCounts = Array(5).fill(0);
    ratings?.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingCounts[r.rating - 1]++;
      }
    });

    const avgRating = ratings?.length
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    return {
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue,
        growth: this.calculateGrowth(monthlyRevenue)
      },
      customers: {
        total: uniqueCustomers.size,
        active: activeCustomers,
        new: customers?.filter(c => new Date(c.created_at) >= startOfMonth).length || 0,
        retention: this.calculateRetention(customers || [])
      },
      services: {
        total: services?.length || 0,
        popular: sortedServices?.map(s => ({
          id: s.id,
          name: s.name,
          bookings: s.bookings?.length || 0
        })) || []
      },
      ratings: {
        average: avgRating,
        total: ratings?.length || 0,
        distribution: ratingCounts
      }
    };
  }

  private calculateGrowth(monthlyRevenue: number[]): number {
    const currentMonth = monthlyRevenue[monthlyRevenue.length - 1];
    const lastMonth = monthlyRevenue[monthlyRevenue.length - 2];
    
    if (!lastMonth) return 0;
    return ((currentMonth - lastMonth) / lastMonth) * 100;
  }

  private calculateRetention(customers: any[]): number {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const lastMonthCustomers = new Set(
      customers
        .filter(c => {
          const date = new Date(c.created_at);
          return date >= lastMonth && date < startOfMonth;
        })
        .map(c => c.customer_id)
    );

    const returningCustomers = customers
      .filter(c => {
        const date = new Date(c.created_at);
        return date >= startOfMonth && lastMonthCustomers.has(c.customer_id);
      })
      .length;

    return lastMonthCustomers.size
      ? (returningCustomers / lastMonthCustomers.size) * 100
      : 0;
  }
}

export const providerAnalytics = new ProviderAnalyticsService();
