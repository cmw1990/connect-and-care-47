import React from "react";
import { UpcomingSchedule } from "@/components/schedule/UpcomingSchedule";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatedCareGuide } from "@/components/guides/AnimatedCareGuide";

const Index = () => {
  const navigate = useNavigate();

  const handleGenerateClick = () => {
    navigate('/care-guides');
  };

  const devExamples = [
    {
      disease: "Alzheimer's Disease",
      description: "Early stage care and management techniques",
      guidelines: [
        "Establish consistent daily routines",
        "Create a safe environment",
        "Use clear, simple communication",
        "Encourage social interaction",
        "Monitor medication schedule"
      ]
    },
    {
      disease: "Diabetes Type 2",
      description: "Daily monitoring and lifestyle adjustments",
      guidelines: [
        "Check blood sugar regularly",
        "Follow meal schedule",
        "Take medications as prescribed",
        "Exercise moderately",
        "Monitor foot health"
      ]
    },
    {
      disease: "Parkinson's Disease",
      description: "Movement assistance and safety precautions",
      guidelines: [
        "Practice balance exercises",
        "Take medications on time",
        "Make home modifications",
        "Attend physical therapy",
        "Monitor symptoms"
      ]
    }
  ];

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

      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-semibold mb-6">Development: Generate Care Guide Videos</h2>
        <div className="grid grid-cols-1 gap-6">
          {devExamples.map((example, index) => (
            <AnimatedCareGuide
              key={index}
              disease={example.disease}
              description={example.description}
              guidelines={example.guidelines}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;