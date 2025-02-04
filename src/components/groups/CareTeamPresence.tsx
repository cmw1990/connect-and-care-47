import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface CareTeamPresenceProps {
  groupId: string;
}

export const CareTeamPresence = ({ groupId }: CareTeamPresenceProps) => {
  const [activeMembers, setActiveMembers] = useState<{
    id: string;
    first_name: string | null;
    last_name: string | null;
    last_active: string;
  }[]>([]);

  useEffect(() => {
    const channel = supabase.channel(`room_${groupId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Presence state:', state);
        updateActiveMembers(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Join:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Leave:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const updateActiveMembers = async (state: any) => {
    const userIds = Object.values(state).map((presence: any) => presence[0].user_id);
    
    if (userIds.length === 0) return;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', userIds);

    if (profiles) {
      setActiveMembers(profiles.map(profile => ({
        ...profile,
        last_active: new Date().toISOString()
      })));
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {activeMembers.map((member) => (
        <div key={member.id} className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.first_name} ${member.last_name}`} />
            <AvatarFallback>
              {member.first_name?.[0]}{member.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {member.first_name} {member.last_name}
            </span>
            <Badge variant="secondary" className="h-5">Active now</Badge>
          </div>
        </div>
      ))}
    </div>
  );
};