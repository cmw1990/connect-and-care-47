import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CareGroup, GroupPrivacySettings } from "@/types/groups";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notificationService } from "@/services/NotificationService";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  type: string;
  read?: boolean;
}

interface Discussion {
  id: string;
  content: string;
  created_at: string;
  group_name?: string;
  created_by_name?: string;
  read?: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function Messages() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [notificationPage, setNotificationPage] = useState(0);
  const [discussionPage, setDiscussionPage] = useState(0);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
  const [hasMoreDiscussions, setHasMoreDiscussions] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const notificationsRef = useRef<HTMLDivElement>(null);
  const discussionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    notificationService.initializePushNotifications();
    fetchInitialData();
    const unsubscribe = subscribeToUpdates();
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchInitialData = async () => {
    await Promise.all([
      fetchNotifications(0),
      fetchDiscussions(0)
    ]);
  };

  const subscribeToUpdates = () => {
    // Subscribe to group posts
    const postsChannel = supabase
      .channel('messages_posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_posts'
        },
        async (payload: any) => {
          console.log('New post received:', payload);
          const { data: post, error } = await supabase
            .from('group_posts')
            .select(`
              *,
              care_groups (name),
              profiles (first_name, last_name)
            `)
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error fetching post details:', error);
            return;
          }

          if (post) {
            const newDiscussion = {
              id: post.id,
              content: post.content,
              created_at: post.created_at,
              group_name: post.care_groups?.name || "Unknown Group",
              created_by_name: post.profiles ? 
                `${post.profiles.first_name || ''} ${post.profiles.last_name || ''}`.trim() || "Unknown User" : 
                "Unknown User",
              read: false
            };

            setDiscussions(prev => [newDiscussion, ...prev]);
            
            const { data: { user } } = await supabase.auth.getUser();
            if (user && post.created_by !== user.id) {
              toast({
                title: "New Group Post",
                description: `New post in ${post.care_groups?.name || 'your care group'}`,
              });
              await notificationService.scheduleLocalNotification(
                "New Group Post",
                `New post in ${post.care_groups?.name || 'your care group'}`
              );
            }
          }
        }
      )
      .subscribe();

    // Subscribe to care groups for status changes
    const groupsChannel = supabase
      .channel('messages_groups')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'care_groups'
        },
        async (payload: any) => {
          console.log('Group update received:', payload);
          const newPrivacySettings = payload.new.privacy_settings as GroupPrivacySettings;
          const oldPrivacySettings = payload.old.privacy_settings as GroupPrivacySettings;
          
          if (newPrivacySettings?.status && newPrivacySettings.status !== oldPrivacySettings?.status) {
            const { data: group } = await supabase
              .from('care_groups')
              .select('name')
              .eq('id', payload.new.id)
              .single();

            if (group) {
              const newNotification = {
                id: payload.new.id,
                title: "Group Status Update",
                message: `${group.name}: Status changed to ${newPrivacySettings.status}`,
                created_at: new Date().toISOString(),
                type: "status",
                read: false
              };

              setNotifications(prev => [newNotification, ...prev]);
              
              toast({
                title: "Group Status Changed",
                description: `${group.name}: Status changed to ${newPrivacySettings.status}`,
              });

              await notificationService.scheduleLocalNotification(
                "Group Status Changed",
                `${group.name}: Status changed to ${newPrivacySettings.status}`
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(groupsChannel);
    };
  };

  const fetchNotifications = async (page: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userGroups } = await supabase
        .from('care_group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (!userGroups) return;

      const groupIds = userGroups.map(ug => ug.group_id);

      const { data: groups, error: groupsError } = await supabase
        .from('care_groups')
        .select(`
          id,
          name,
          privacy_settings,
          updated_at
        `)
        .in('id', groupIds)
        .order('updated_at', { ascending: false })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

      if (groupsError) throw groupsError;

      const newNotifications = groups
        .filter(group => (group.privacy_settings as CareGroup['privacy_settings'])?.status)
        .map(group => ({
          id: group.id,
          title: "Group Status Update",
          message: `${group.name}: ${(group.privacy_settings as CareGroup['privacy_settings'])?.status}`,
          created_at: group.updated_at,
          type: "status",
          read: false
        }));

      setNotifications(prev => page === 0 ? newNotifications : [...prev, ...newNotifications]);
      setHasMoreNotifications(groups.length === ITEMS_PER_PAGE);
      updateUnreadCount([...notifications, ...newNotifications]);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    }
  };

  const fetchDiscussions = async (page: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userGroups } = await supabase
        .from('care_group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (!userGroups) return;

      const groupIds = userGroups.map(ug => ug.group_id);

      const { data: groupPosts, error } = await supabase
        .from("group_posts")
        .select(`
          id,
          content,
          created_at,
          care_groups(name),
          profiles(first_name, last_name)
        `)
        .in('group_id', groupIds)
        .order("created_at", { ascending: false })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      const formattedDiscussions = groupPosts.map((post: any) => ({
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        group_name: post.care_groups?.name || "Unknown Group",
        created_by_name: post.profiles
          ? `${post.profiles.first_name || ""} ${post.profiles.last_name || ""}`.trim() || "Unknown User"
          : "Unknown User",
        read: false
      }));

      setDiscussions(prev => page === 0 ? formattedDiscussions : [...prev, ...formattedDiscussions]);
      setHasMoreDiscussions(groupPosts.length === ITEMS_PER_PAGE);
      updateUnreadCount([...discussions, ...formattedDiscussions]);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      toast({
        title: "Error",
        description: "Failed to load discussions",
        variant: "destructive",
      });
    }
  };

  const handleScroll = async (ref: React.RefObject<HTMLDivElement>, type: 'notifications' | 'discussions') => {
    if (!ref.current) return;

    const { scrollTop, scrollHeight, clientHeight } = ref.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;

    if (isNearBottom) {
      if (type === 'notifications' && hasMoreNotifications) {
        const nextPage = notificationPage + 1;
        setNotificationPage(nextPage);
        await fetchNotifications(nextPage);
      } else if (type === 'discussions' && hasMoreDiscussions) {
        const nextPage = discussionPage + 1;
        setDiscussionPage(nextPage);
        await fetchDiscussions(nextPage);
      }
    }
  };

  const updateUnreadCount = (items: (Notification | Discussion)[]) => {
    const unread = items.filter(item => !item.read).length;
    setUnreadCount(unread);
  };

  const markAsRead = (id: string, type: 'notification' | 'discussion') => {
    if (type === 'notification') {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } else {
      setDiscussions(prev => 
        prev.map(d => d.id === id ? { ...d, read: true } : d)
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs defaultValue="notifications" className="w-full h-full">
        <TabsList className="fixed top-0 left-0 right-0 z-10 grid w-full grid-cols-2 bg-white border-b">
          <TabsTrigger value="notifications" className="p-4 relative">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
            )}
          </TabsTrigger>
          <TabsTrigger value="discussions" className="p-4">
            <MessageSquare className="h-4 w-4 mr-2" />
            Discussions
          </TabsTrigger>
        </TabsList>
        <div className="pt-16 pb-20">
          <TabsContent value="notifications" className="m-0">
            <ScrollArea 
              ref={notificationsRef} 
              className="h-[calc(100vh-9rem)]"
              onScroll={() => handleScroll(notificationsRef, 'notifications')}
            >
              <div className="space-y-2 p-4">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`shadow-sm ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
                    onClick={() => markAsRead(notification.id, 'notification')}
                  >
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
            </ScrollArea>
          </TabsContent>
          <TabsContent value="discussions" className="m-0">
            <ScrollArea 
              ref={discussionsRef} 
              className="h-[calc(100vh-9rem)]"
              onScroll={() => handleScroll(discussionsRef, 'discussions')}
            >
              <div className="space-y-2 p-4">
                {discussions.map((discussion) => (
                  <Card 
                    key={discussion.id} 
                    className={`shadow-sm ${!discussion.read ? 'border-l-4 border-l-primary' : ''}`}
                    onClick={() => markAsRead(discussion.id, 'discussion')}
                  >
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
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
