import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { MessageSquare, Send } from "lucide-react";
import { GroupStatusBar } from "@/components/groups/GroupStatusBar";
import { GroupTasks } from "@/components/groups/GroupTasks";
import { GroupPosts } from "@/components/groups/GroupPosts";
import { PatientInfoCard } from "@/components/groups/PatientInfoCard";
import { MiniCalendar } from "@/components/groups/MiniCalendar";
import { CareAssistant } from "@/components/ai/CareAssistant";
import { useIsMobile } from "@/hooks/use-mobile";

interface GroupPost {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  group_id: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export default function GroupDetails() {
  const { groupId } = useParams();
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (groupId) {
      fetchPosts();
      fetchGroupMembers();
    }
  }, [groupId]);

  const fetchGroupMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('care_group_members')
        .select(`
          user_id,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('group_id', groupId);

      if (error) throw error;
      setGroupMembers(data || []);
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  };

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
      await fetchPosts();
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

  if (!groupId) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          <GroupStatusBar groupId={groupId} />
          <GroupTasks groupId={groupId} members={groupMembers} />
          <GroupPosts groupId={groupId} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <PatientInfoCard groupId={groupId} />
          <MiniCalendar groupId={groupId} />
          {!isMobile && <CareAssistant groupId={groupId} />}
        </div>
      </div>
      {isMobile && (
        <div className="mt-6">
          <CareAssistant groupId={groupId} />
        </div>
      )}
    </div>
  );
}