import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCareGuide } from "@/components/guides/AnimatedCareGuide";

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
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-white">
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Care Guides</CardTitle>
            <CardDescription>
              Interactive guides with step-by-step care instructions and AI-generated visual aids
            </CardDescription>
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