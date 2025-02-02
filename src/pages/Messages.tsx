import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  type: string;
}

interface Discussion {
  id: string;
  content: string;
  created_at: string;
  group_name?: string;
  created_by_name?: string;
}

export default function Messages() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    fetchDiscussions();
  }, []);

  const fetchNotifications = async () => {
    try {
      // In a real app, you would fetch notifications from your backend
      // For now, we'll use dummy data
      const dummyNotifications = [
        {
          id: "1",
          title: "New Task Assigned",
          message: "You have been assigned a new task in Family Care Group",
          created_at: new Date().toISOString(),
          type: "task",
        },
        {
          id: "2",
          title: "Medication Reminder",
          message: "Time to take morning medications",
          created_at: new Date().toISOString(),
          type: "medication",
        },
      ];
      setNotifications(dummyNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    }
  };

  const fetchDiscussions = async () => {
    try {
      const { data: groupPosts, error } = await supabase
        .from("group_posts")
        .select(`
          id,
          content,
          created_at,
          care_groups(name),
          profiles(first_name, last_name)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedDiscussions = groupPosts.map((post: any) => ({
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        group_name: post.care_groups?.name || "Unknown Group",
        created_by_name: post.profiles
          ? `${post.profiles.first_name || ""} ${post.profiles.last_name || ""}`
          : "Unknown User",
      }));

      setDiscussions(formattedDiscussions);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      toast({
        title: "Error",
        description: "Failed to load discussions",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="discussions">
            <MessageSquare className="h-4 w-4 mr-2" />
            Discussions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 rounded-lg border space-y-2"
                >
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-gray-600">
                    {notification.message}
                  </p>
                  <span className="text-xs text-gray-400">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="discussions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Discussions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {discussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="p-4 rounded-lg border space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium">
                      {discussion.created_by_name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {discussion.group_name}
                    </span>
                  </div>
                  <p className="text-sm">{discussion.content}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(discussion.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}