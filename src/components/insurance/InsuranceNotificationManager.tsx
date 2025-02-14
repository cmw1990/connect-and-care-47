
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check } from 'lucide-react';

interface InsuranceNotification {
  id: string;
  type: 'claim_update' | 'document_status' | 'coverage_alert' | 'preauth_required';
  title: string;
  message: string;
  read: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export const InsuranceNotificationManager = () => {
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ['insuranceNotifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('insurance_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InsuranceNotification[];
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('insurance_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['insuranceNotifications']);
    }
  });

  const getNotificationIcon = (type: InsuranceNotification['type']) => {
    switch (type) {
      case 'claim_update':
        return '💰';
      case 'document_status':
        return '📄';
      case 'coverage_alert':
        return '⚠️';
      case 'preauth_required':
        return '🔒';
      default:
        return '📢';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Notifications
        </CardTitle>
        <Bell className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications?.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.read ? 'bg-muted' : 'bg-primary/5'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <span className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsReadMutation.mutate(notification.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {(!notifications || notifications.length === 0) && (
            <p className="text-center text-muted-foreground py-4">
              No new notifications
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
