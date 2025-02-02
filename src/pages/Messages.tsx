import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CareGroup } from "@/types/groups";

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
    subscribeToNotifications();
  }, []);

  const subscribeToNotifications = () => {
    // Subscribe to group posts
    const postsChannel = supabase
      .channel('public:group_posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_posts'
        },
        (payload: any) => {
          toast({
            title: "New Group Post",
            description: "Someone posted in your care group",
          });
          fetchDiscussions();
        }
      )
      .subscribe();

    // Subscribe to care groups for status changes
    const groupsChannel = supabase
      .channel('public:care_groups')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'care_groups'
        },
        (payload: any) => {
          const newStatus = (payload.new.privacy_settings as CareGroup['privacy_settings'])?.status;
          const oldStatus = (payload.old.privacy_settings as CareGroup['privacy_settings'])?.status;
          if (newStatus && newStatus !== oldStatus) {
            toast({
              title: "Group Status Changed",
              description: `Group status has been updated to ${newStatus}`,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to tasks
    const tasksChannel = supabase
      .channel('public:tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Task",
              description: "A new task has been created",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Task Updated",
              description: "A task has been updated",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(groupsChannel);
      supabase.removeChannel(tasksChannel);
    };
  };

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch group status changes
      const { data: groups, error: groupsError } = await supabase
        .from('care_groups')
        .select(`
          id,
          name,
          privacy_settings,
          updated_at
        `)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (groupsError) throw groupsError;

      const notifications = groups
        .filter(group => (group.privacy_settings as CareGroup['privacy_settings'])?.status)
        .map(group => ({
          id: group.id,
          title: "Group Status Update",
          message: `${group.name}: ${(group.privacy_settings as CareGroup['privacy_settings'])?.status}`,
          created_at: group.updated_at,
          type: "status",
        }));

      setNotifications(notifications);
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
    <div className="min-h-screen bg-gray-50">
      <Tabs defaultValue="notifications" className="w-full h-full">
        <TabsList className="fixed top-0 left-0 right-0 z-10 grid w-full grid-cols-2 bg-white border-b">
          <TabsTrigger value="notifications" className="p-4">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="discussions" className="p-4">
            <MessageSquare className="h-4 w-4 mr-2" />
            Discussions
          </TabsTrigger>
        </TabsList>
        <div className="pt-16 pb-20">
          <TabsContent value="notifications" className="m-0">
            <div className="space-y-2 p-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className="shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-sm text-gray-600">
                      {notification.message}
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="discussions" className="m-0">
            <div className="space-y-2 p-4">
              {discussions.map((discussion) => (
                <Card key={discussion.id} className="shadow-sm">
                  <CardContent className="p-4 space-y-2">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
