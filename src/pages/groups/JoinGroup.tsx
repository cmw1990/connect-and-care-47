
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users } from "lucide-react";
import type { CareGroup } from "@/types/groups";

export const JoinGroup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState<CareGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('care_groups')
        .select(`
          id,
          name,
          description,
          created_at,
          privacy_settings,
          care_group_members (
            id
          )
        `)
        .eq('privacy_settings->>visibility', 'public')
        .ilike('name', `%${searchQuery}%`);

      if (error) throw error;

      setGroups(data.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description || '',
        created_at: group.created_at,
        member_count: group.care_group_members?.length || 0,
        is_public: true
      })));
    } catch (error) {
      console.error('Error searching groups:', error);
      toast({
        title: "Error",
        description: "Failed to search groups",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('care_group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully joined the group",
      });
      
      navigate(`/groups/${groupId}`);
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Failed to join group",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Join a Care Group</h1>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="flex gap-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for care groups..."
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              disabled={isLoading}
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </Card>

        {groups.map((group) => (
          <Card key={group.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {group.member_count} members
                </div>
              </div>
              <Button onClick={() => handleJoin(group.id)}>
                Join Group
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JoinGroup;
