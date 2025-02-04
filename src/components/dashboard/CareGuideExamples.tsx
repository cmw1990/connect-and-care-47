import { AnimatedCareGuide } from "@/components/guides/AnimatedCareGuide";

export const CareGuideExamples = () => {
  const examples = [
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
    }
  ];

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-semibold mb-6">Care Guide Examples</h2>
      <div className="grid grid-cols-1 gap-6">
        {examples.map((example, index) => (
          <AnimatedCareGuide
            key={index}
            disease={example.disease}
            description={example.description}
            guidelines={example.guidelines}
          />
        ))}
      </div>
    </div>
  );
};