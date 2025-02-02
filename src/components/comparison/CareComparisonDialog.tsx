import { Button } from "@/components/ui/button";
import { ChartBar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CareComparisonDialog = () => {
  const navigate = useNavigate();

  return (
    <Button 
      variant="outline" 
      className="gap-2"
      onClick={() => navigate('/compare')}
    >
      <ChartBar className="h-4 w-4" />
      Compare Options
    </Button>
  );
};