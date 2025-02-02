import { 
  PushNotifications,
  PushNotificationSchema,
  ActionPerformed,
} from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { supabase } from '@/integrations/supabase/client';

class NotificationService {
  async initializePushNotifications() {
    try {
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive === 'granted') {
        await PushNotifications.register();

        PushNotifications.addListener('registration', async (token) => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('notification_settings')
              .eq('id', user.id)
              .single();

            await supabase
              .from('profiles')
              .update({ 
                notification_settings: {
                  ...profile?.notification_settings,
                  push_token: token.value
                }
              })
              .eq('id', user.id);
          }
        });

        PushNotifications.addListener('pushNotificationReceived',
          (notification: PushNotificationSchema) => {
            console.log('Push notification received:', notification);
          }
        );

        PushNotifications.addListener('pushNotificationActionPerformed',
          (action: ActionPerformed) => {
            console.log('Push notification action performed:', action);
          }
        );
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  async scheduleLocalNotification(title: string, body: string, schedule?: Date) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: new Date().getTime(),
            schedule: schedule ? { at: schedule } : undefined,
            sound: 'beep.wav',
            attachments: undefined,
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }

  async scheduleMoodCheckReminder() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    await this.scheduleLocalNotification(
      'Mood Check-in',
      'How are you feeling today? Take a moment to reflect and journal your thoughts.',
      tomorrow
    );
  }

  async scheduleTaskReminders(tasks: any[]) {
    for (const task of tasks) {
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        const reminderDate = new Date(dueDate);
        reminderDate.setHours(reminderDate.getHours() - 1);

        await this.scheduleLocalNotification(
          'Task Reminder',
          `Don't forget: ${task.title} is due in 1 hour`,
          reminderDate
        );
      }
    }
  }

  async notifyGroupActivity(groupId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Subscribe to real-time updates for group posts
    const channel = supabase
      .channel(`group-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_posts',
          filter: `group_id=eq.${groupId}`
        },
        async (payload) => {
          if (payload.new.created_by !== user.id) {
            await this.scheduleLocalNotification(
              'New Group Post',
              'Someone posted in your care group'
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const notificationService = new NotificationService();