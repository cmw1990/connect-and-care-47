
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { CareOverview } from "@/components/dashboard/CareOverview";
import { CareAssistant } from "@/components/ai/CareAssistant";
import { CareTeamChat } from "@/components/chat/CareTeamChat";
import { CareTeamPresence } from "@/components/groups/CareTeamPresence";
import { MedicationDashboard } from "@/components/medications/MedicationDashboard";
import { CheckInManager } from "@/components/checkins/CheckInManager";
import { WellnessTracker } from "@/components/wellness/WellnessTracker";

const GroupDetails = () => {
  const { groupId } = useParams();

  if (!groupId) {
    return <div>Group not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Main content - 2 columns wide */}
        <div className="lg:col-span-2 space-y-6">
          <CareOverview groupId={groupId} />
          
          <Card className="p-6">
            <CareTeamPresence groupId={groupId} />
          </Card>
          
          <MedicationDashboard groupId={groupId} />
          
          <CheckInManager groupId={groupId} />
          
          <WellnessTracker groupId={groupId} />
        </div>

        {/* Sidebar - 1 column wide */}
        <div className="space-y-6">
          <Card className="p-6">
            <CareTeamChat groupId={groupId} />
          </Card>
          
          <Card className="p-6">
            <CareAssistant groupId={groupId} />
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default GroupDetails;

