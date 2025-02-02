import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { MessageSquare, Send } from "lucide-react";

interface GroupPost {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  group_id: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

export default function GroupDetails() {
  const { groupId } = useParams();
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    fetchPosts();
    const channel = supabase
      .channel('public:group_posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_posts',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          setPosts((currentPosts) => [payload.new as GroupPost, ...currentPosts]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('group_posts')
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: t("error"),
        description: t("errorFetchingPosts"),
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('group_posts')
        .insert({
          content: newPost.trim(),
          group_id: groupId,
          created_by: user.id,
        });

      if (error) throw error;

      setNewPost("");
      toast({
        title: t("success"),
        description: t("postCreated"),
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: t("error"),
        description: t("errorCreatingPost"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder={t("writeMessage")}
          className="flex-1"
        />
        <ButtonPrimary type="submit" disabled={loading}>
          <Send className="h-4 w-4" />
        </ButtonPrimary>
      </form>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="font-medium">
                  {post.profiles.first_name} {post.profiles.last_name}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{post.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}