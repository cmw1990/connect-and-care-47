import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { GroupStatusBar } from "@/components/groups/GroupStatusBar";
import { GroupTasks } from "@/components/groups/GroupTasks";
import { GroupPosts } from "@/components/groups/GroupPosts";
import { PatientInfoCard } from "@/components/groups/PatientInfoCard";
import { MiniCalendar } from "@/components/groups/MiniCalendar";
import { CareAssistant } from "@/components/ai/CareAssistant";
import { FacilityDashboard } from "@/components/roles/FacilityDashboard";
import { ProfessionalCaregiverDashboard } from "@/components/roles/ProfessionalCaregiverDashboard";
import { FamilyCaregiverView } from "@/components/roles/FamilyCaregiverView";
import { CareCircleManager } from "@/components/groups/CareCircleManager";
import { CareUpdates } from "@/components/groups/CareUpdates";
import { WellnessTracker } from "@/components/wellness/WellnessTracker";
import { CareRoutineManager } from "@/components/routines/CareRoutineManager";
import { CaregiverSupport } from "@/components/support/CaregiverSupport";
import { useIsMobile } from "@/hooks/use-mobile";

export default function GroupDetails() {
  const { groupId } = useParams();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (groupId) {
      fetchUserRole();
      fetchGroupMembers();
    }
  }, [groupId]);

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserRole(data?.user_type);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

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

  if (!groupId) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          <GroupStatusBar groupId={groupId} />
          <CareCircleManager groupId={groupId} />
          <CareUpdates groupId={groupId} />
          <WellnessTracker groupId={groupId} />
          <CareRoutineManager groupId={groupId} />
          {renderRoleBasedDashboard()}
          <GroupTasks groupId={groupId} members={groupMembers} />
          <GroupPosts groupId={groupId} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <PatientInfoCard groupId={groupId} />
          <CaregiverSupport groupId={groupId} />
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
