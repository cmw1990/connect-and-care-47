import React from "react";
import { UpcomingSchedule } from "@/components/schedule/UpcomingSchedule";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleGenerateClick = () => {
    navigate('/care-guides');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome to Care Companion</h1>
      
      <div className="mb-8">
        <Button 
          onClick={handleGenerateClick}
          className="w-full md:w-auto bg-primary hover:bg-primary/90"
        >
          <Play className="mr-2 h-4 w-4" />
          Generate Care Guides
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingSchedule />
      </div>
    </div>
  );
};

export default Index;