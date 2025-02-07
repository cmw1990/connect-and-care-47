
import { useParams } from "react-router-dom";
import { CareOverview } from "@/components/dashboard/CareOverview";
import { CareAssistant } from "@/components/ai/CareAssistant";
import { Card } from "@/components/ui/card";

const GroupDetails = () => {
  const { groupId } = useParams();

  if (!groupId) {
    return <div>Group not found</div>;
  }

  return (
    <div className="space-y-6">
      <CareOverview groupId={groupId} />
      
      <div className="mt-6">
        <CareAssistant groupId={groupId} />
      </div>
    </div>
  );
};

export default GroupDetails;
