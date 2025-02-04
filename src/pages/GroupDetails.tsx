import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CareCircleManager } from "@/components/groups/CareCircleManager";
import { PatientInfoCard } from "@/components/groups/PatientInfoCard";
import { GroupCalendar } from "@/components/groups/GroupCalendar";
import { CareUpdates } from "@/components/groups/CareUpdates";
import { GroupTasks } from "@/components/groups/GroupTasks";
import { GroupPosts } from "@/components/groups/GroupPosts";
import { VideoConsultations } from "@/components/video/VideoConsultations";
import { CareQualityMetrics } from "@/components/metrics/CareQualityMetrics";
import { DocumentSharing } from "@/components/documents/DocumentSharing";
import { ResourceLibrary } from "@/components/library/ResourceLibrary";
import { CareTeamChat } from "@/components/chat/CareTeamChat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const GroupDetails = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [patientInfo, setPatientInfo] = useState(null);
  const [groupMembers, setGroupMembers] = useState<{
    user_id: string;
    profiles: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (groupId) {
      fetchPatientInfo();
      fetchGroupMembers();
    }
  }, [groupId]);

  const fetchPatientInfo = async () => {
    if (!groupId) return;

    try {
      const { data, error } = await supabase
        .from('patient_info')
        .select('*')
        .eq('group_id', groupId)
        .single();

      if (error) throw error;
      setPatientInfo(data);
    } catch (error) {
      console.error('Error fetching patient info:', error);
      toast({
        title: "Error",
        description: "Failed to load patient information",
        variant: "destructive",
      });
    }
  };

  const fetchGroupMembers = async () => {
    if (!groupId) return;

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
      toast({
        title: "Error",
        description: "Failed to load group members",
        variant: "destructive",
      });
    }
  };

  if (!groupId) {
    return <div>Group not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PatientInfoCard groupId={groupId} patientInfo={patientInfo} />
          <CareQualityMetrics groupId={groupId} />
          <VideoConsultations groupId={groupId} />
          <GroupCalendar groupId={groupId} />
          <GroupTasks groupId={groupId} members={groupMembers} />
          <GroupPosts groupId={groupId} />
          <ResourceLibrary groupId={groupId} />
        </div>
        <div className="space-y-6">
          <CareCircleManager groupId={groupId} />
          <CareTeamChat groupId={groupId} />
          <CareUpdates groupId={groupId} />
          <DocumentSharing groupId={groupId} />
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;