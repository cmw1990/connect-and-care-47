import { supabase, subscribeToChannel } from '@/lib/supabase/client';
import { Tables } from '@/types/database.types';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Platform } from '@capacitor/platform';

export type NotificationType =
  | 'care_alert'
  | 'medication'
  | 'appointment'
  | 'checkin'
  | 'message'
  | 'health_alert'
  | 'task'
  | 'system';

export interface NotificationConfig {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  action?: {
    type: string;
    payload: any;
  };
  scheduling?: {
    at?: Date;
    every?: string; // cron expression
    repeating?: boolean;
  };
}

class NotificationService {
  private subscriptions: (() => void)[] = [];
  private isNative: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    const platform = await Platform.get();
    this.isNative = platform.platform !== 'web';

    if (this.isNative) {
      await LocalNotifications.requestPermissions();
    }

    // Subscribe to real-time notifications
    this.subscriptions.push(
      subscribeToChannel('notifications', this.handleRealtimeNotification)
    );
  }

  private handleRealtimeNotification = async (payload: any) => {
    const notification = payload.new as Tables['notifications']['Row'];
    
    if (this.isNative) {
      await this.showNativeNotification(notification);
    } else {
      this.showWebNotification(notification);
    }

    // Trigger haptic feedback on mobile devices
    if (this.isNative) {
      await Haptics.impact({
        style: notification.type === 'care_alert' ? ImpactStyle.Heavy : ImpactStyle.Medium,
      });
    }
  };

  private async showNativeNotification(notification: Tables['notifications']['Row']) {
    await LocalNotifications.schedule({
      notifications: [{
        id: Date.now(),
        title: notification.title,
        body: notification.message,
        schedule: { at: new Date() },
        sound: notification.type === 'care_alert' ? 'alert.wav' : 'notification.wav',
        attachments: null,
        actionTypeId: notification.type,
        extra: notification.data,
      }],
    });
  }

  private showWebNotification(notification: Tables['notifications']['Row']) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/notification-icon.png',
        tag: notification.id,
        data: notification.data,
      });
    }
  }

  async create(config: NotificationConfig) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: config.userId,
        type: config.type,
        title: config.title,
        message: config.message,
        data: config.data || {},
        priority: config.priority || 'normal',
      })
      .select()
      .single();

    if (error) throw error;

    // Handle scheduled notifications
    if (config.scheduling) {
      if (this.isNative && config.scheduling.at) {
        await LocalNotifications.schedule({
          notifications: [{
            id: Date.now(),
            title: config.title,
            body: config.message,
            schedule: { at: config.scheduling.at },
            sound: config.type === 'care_alert' ? 'alert.wav' : 'notification.wav',
            attachments: null,
            actionTypeId: config.type,
            extra: config.data,
          }],
        });
      }
    }

    return data;
  }

  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
  }

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);

    if (error) throw error;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .is('read_at', null);

    if (error) throw error;
    return count || 0;
  }

  async getNotifications(userId: string, params: {
    page?: number;
    limit?: number;
    type?: NotificationType;
    unreadOnly?: boolean;
  } = {}) {
    const {
      page = 1,
      limit = 20,
      type,
      unreadOnly = false,
    } = params;

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (unreadOnly) {
      query = query.is('read_at', null);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return {
      notifications: data,
      total: count || 0,
      hasMore: (count || 0) > to + 1,
    };
  }

  async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  }

  async deleteAllNotifications(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }

  cleanup() {
    // Unsubscribe from all real-time subscriptions
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
  }
}

export const notificationService = new NotificationService();
