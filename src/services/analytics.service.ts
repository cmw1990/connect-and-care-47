import { supabase } from '@/lib/supabase/client';
import { Platform } from '@capacitor/platform';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';

export type AnalyticsEvent = {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
};

export type PerformanceMetric = {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'percent' | 'count';
  metadata?: Record<string, any>;
};

class AnalyticsService {
  private sessionId: string;
  private deviceInfo: any;
  private isInitialized: boolean = false;
  private queue: Array<{ type: 'event' | 'metric', data: any }> = [];
  private batchSize: number = 10;
  private batchTimeout: number = 5000; // 5 seconds
  private batchTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = crypto.randomUUID();
    this.initialize();
  }

  private async initialize() {
    try {
      // Get device information
      const platform = await Platform.get();
      const deviceInfo = await Device.getInfo();
      const batteryInfo = await Device.getBatteryInfo();
      const appInfo = await App.getInfo();

      this.deviceInfo = {
        platform: platform.platform,
        model: deviceInfo.model,
        operatingSystem: deviceInfo.operatingSystem,
        osVersion: deviceInfo.osVersion,
        manufacturer: deviceInfo.manufacturer,
        isVirtual: deviceInfo.isVirtual,
        batteryLevel: batteryInfo.batteryLevel,
        isCharging: batteryInfo.isCharging,
        appVersion: appInfo.version,
        appBuild: appInfo.build,
      };

      this.isInitialized = true;
      this.processQueue();
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  private async processQueue() {
    if (!this.isInitialized || this.queue.length === 0) return;

    const events = this.queue.filter(item => item.type === 'event').map(item => item.data);
    const metrics = this.queue.filter(item => item.type === 'metric').map(item => item.data);

    if (events.length > 0) {
      await this.batchTrackEvents(events);
    }

    if (metrics.length > 0) {
      await this.batchTrackMetrics(metrics);
    }

    this.queue = [];
  }

  private scheduleBatchProcessing() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      this.processQueue();
    }, this.batchTimeout);
  }

  private async batchTrackEvents(events: AnalyticsEvent[]) {
    const { error } = await supabase
      .from('analytics_events')
      .insert(events.map(event => ({
        session_id: this.sessionId,
        category: event.category,
        action: event.action,
        label: event.label,
        value: event.value,
        metadata: {
          ...event.metadata,
          device: this.deviceInfo,
        },
        timestamp: new Date().toISOString(),
      })));

    if (error) {
      console.error('Failed to track events:', error);
    }
  }

  private async batchTrackMetrics(metrics: PerformanceMetric[]) {
    const { error } = await supabase
      .from('performance_metrics')
      .insert(metrics.map(metric => ({
        session_id: this.sessionId,
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        metadata: {
          ...metric.metadata,
          device: this.deviceInfo,
        },
        timestamp: new Date().toISOString(),
      })));

    if (error) {
      console.error('Failed to track metrics:', error);
    }
  }

  trackEvent(event: AnalyticsEvent) {
    this.queue.push({ type: 'event', data: event });

    if (this.queue.length >= this.batchSize) {
      this.processQueue();
    } else {
      this.scheduleBatchProcessing();
    }
  }

  trackMetric(metric: PerformanceMetric) {
    this.queue.push({ type: 'metric', data: metric });

    if (this.queue.length >= this.batchSize) {
      this.processQueue();
    } else {
      this.scheduleBatchProcessing();
    }
  }

  async getEventAnalytics(params: {
    category?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    groupBy?: 'hour' | 'day' | 'week' | 'month';
  }) {
    let query = supabase
      .from('analytics_events')
      .select('*');

    if (params.category) {
      query = query.eq('category', params.category);
    }

    if (params.action) {
      query = query.eq('action', params.action);
    }

    if (params.startDate) {
      query = query.gte('timestamp', params.startDate.toISOString());
    }

    if (params.endDate) {
      query = query.lte('timestamp', params.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    if (params.groupBy) {
      return this.groupAnalytics(data, params.groupBy);
    }

    return data;
  }

  async getMetricAnalytics(params: {
    name?: string;
    startDate?: Date;
    endDate?: Date;
    groupBy?: 'hour' | 'day' | 'week' | 'month';
  }) {
    let query = supabase
      .from('performance_metrics')
      .select('*');

    if (params.name) {
      query = query.eq('name', params.name);
    }

    if (params.startDate) {
      query = query.gte('timestamp', params.startDate.toISOString());
    }

    if (params.endDate) {
      query = query.lte('timestamp', params.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    if (params.groupBy) {
      return this.groupAnalytics(data, params.groupBy);
    }

    return data;
  }

  private groupAnalytics(data: any[], groupBy: 'hour' | 'day' | 'week' | 'month') {
    const groups = new Map();

    data.forEach(item => {
      const date = new Date(item.timestamp);
      let key: string;

      switch (groupBy) {
        case 'hour':
          key = date.toISOString().slice(0, 13);
          break;
        case 'day':
          key = date.toISOString().slice(0, 10);
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().slice(0, 10);
          break;
        case 'month':
          key = date.toISOString().slice(0, 7);
          break;
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(item);
    });

    return Array.from(groups.entries()).map(([key, items]) => ({
      period: key,
      count: items.length,
      items,
    }));
  }

  cleanup() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    this.processQueue();
  }
}

export const analyticsService = new AnalyticsService();
