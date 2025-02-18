
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users, UserPlus, Shield, ArrowRight } from "lucide-react";
import type { CareGroup } from "@/types/groups";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Join a Care Group</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect with care groups in your area and join a supportive community dedicated to providing the best care possible.
          </p>
        </div>

        <Card className="bg-gradient-to-br from-card to-muted/50">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for care groups..."
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {groups.map((group) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-3 flex-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold">{group.name}</h3>
                          <Badge variant="secondary" className="bg-primary/10">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {group.member_count} members
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleJoin(group.id)}
                      className="bg-primary hover:bg-primary/90 hover:translate-x-1 transition-all duration-300"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Group
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {groups.length === 0 && searchQuery && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No groups found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or create a new group
              </p>
              <Button
                onClick={() => navigate('/groups/create')}
                className="mt-4"
                variant="outline"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create New Group
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default JoinGroup;
