import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedCareGuide } from "@/components/guides/AnimatedCareGuide";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const careGuides = [
  {
    disease: "Alzheimer's Disease",
    description: "A progressive brain disorder that affects memory and thinking skills",
    guidelines: [
      "Establish consistent daily routines to reduce confusion",
      "Create a safe and familiar environment",
      "Use simple, clear communication and visual cues",
      "Monitor medication schedule closely",
      "Encourage social interaction and mental stimulation",
      "Provide memory aids and labels around the home"
    ]
  },
  {
    disease: "Parkinson's Disease",
    description: "A disorder affecting movement and motor control",
    guidelines: [
      "Maintain a regular exercise routine focused on balance",
      "Time medication doses precisely for optimal effect",
      "Make home modifications to prevent falls",
      "Use adaptive equipment for daily tasks",
      "Schedule regular physical therapy sessions",
      "Monitor diet and nutrition carefully"
    ]
  },
  {
    disease: "Diabetes",
    description: "A condition affecting blood sugar regulation",
    guidelines: [
      "Monitor blood sugar levels regularly",
      "Follow a consistent meal schedule",
      "Maintain detailed records of readings",
      "Check feet daily for any wounds",
      "Take medications as prescribed",
      "Stay hydrated and exercise regularly"
    ]
  },
  {
    disease: "Heart Disease",
    description: "Conditions affecting heart function and circulation",
    guidelines: [
      "Monitor blood pressure daily",
      "Take medications exactly as prescribed",
      "Follow a heart-healthy diet plan",
      "Exercise within recommended limits",
      "Recognize warning signs of complications",
      "Attend all scheduled medical check-ups"
    ]
  }
];

export const CareGuides = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGuides, setGeneratedGuides] = useState<string[]>([]);
  const { toast } = useToast();

  const generateAllGuides = async () => {
    setIsGenerating(true);
    try {
      const guides = [];
      for (const guide of careGuides) {
        const { data, error } = await supabase.functions.invoke('generate-care-image', {
          body: {
            disease: guide.disease,
            description: guide.description
          }
        });

        if (error) throw error;
        
        guides.push(data.imageUrl);
        
        toast({
          title: "Guide Generated",
          description: `Generated guide for ${guide.disease}`,
        });
      }
      setGeneratedGuides(guides);
    } catch (error) {
      console.error('Error generating guides:', error);
      toast({
        title: "Error",
        description: "Failed to generate care guides",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-white">
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Care Guides</CardTitle>
                <CardDescription>
                  Interactive guides with step-by-step care instructions and AI-generated visual aids
                </CardDescription>
              </div>
              <Button
                onClick={generateAllGuides}
                disabled={isGenerating}
                className="animate-fade-in"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Guides...
                  </>
                ) : (
                  'Generate All Guides'
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {careGuides.map((guide) => (
            <AnimatedCareGuide
              key={guide.disease}
              disease={guide.disease}
              description={guide.description}
              guidelines={guide.guidelines}
            />
          ))}
        </div>
      </main>
    </div>
  );
};
