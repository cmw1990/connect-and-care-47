import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CaregiverSupportProps {
  groupId: string;
}

export const CaregiverSupport = ({ groupId }: CaregiverSupportProps) => {
  const [supportGroups, setSupportGroups] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSupportGroups();
  }, []);

  const fetchSupportGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('support_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSupportGroups(data || []);
    } catch (error) {
      console.error('Error fetching support groups:', error);
    }
  };

  const joinSupportGroup = async (groupId: string) => {
    toast({
      title: "Success",
      description: "Request to join support group sent",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Caregiver Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Support Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportGroups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{group.name}</h3>
                        <p className="text-sm text-gray-500">{group.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => joinSupportGroup(group.id)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Join
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat with Support
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Find Local Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};