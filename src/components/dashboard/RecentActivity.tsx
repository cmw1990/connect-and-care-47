import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface RecentActivityProps {
  groupId?: string;
}

export const RecentActivity = ({ groupId }: RecentActivityProps) => {
  const { data: activities } = useQuery({
    queryKey: ['recentActivities', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const { data: updates } = await supabase
        .from('care_updates')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(5);
        
      return updates || [];
    },
    enabled: !!groupId
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'schedule':
        return <Calendar className="h-4 w-4" />;
      case 'check_in':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-primary">
                {getActivityIcon(activity.update_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">
                  {activity.content}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.created_at).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
          
          {(!activities || activities.length === 0) && (
            <p className="text-center text-muted-foreground py-4">
              No recent activity
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};