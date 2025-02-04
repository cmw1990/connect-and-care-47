import { Navbar } from "@/components/navigation/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AnimatedCareGuide } from "@/components/guides/AnimatedCareGuide";

const careGuides = [
  {
    disease: "Alzheimer's Disease",
    description: "A progressive brain disorder that affects memory and thinking skills",
    guidelines: [
      "Establish daily routines",
      "Create a safe environment",
      "Use simple, clear communication",
      "Monitor medication schedule",
      "Encourage social interaction",
      "Provide memory aids and labels"
    ]
  },
  {
    disease: "Parkinson's Disease",
    description: "A disorder affecting movement and motor control",
    guidelines: [
      "Maintain regular exercise routine",
      "Ensure medication timing is precise",
      "Make home modifications for safety",
      "Use adaptive equipment when needed",
      "Schedule regular physical therapy",
      "Monitor diet and nutrition"
    ]
  },
  {
    disease: "Diabetes",
    description: "A condition affecting blood sugar regulation",
    guidelines: [
      "Regular blood sugar monitoring",
      "Maintain consistent meal times",
      "Follow dietary restrictions",
      "Check feet daily for wounds",
      "Keep detailed health records",
      "Coordinate with healthcare team"
    ]
  },
  {
    disease: "Heart Disease",
    description: "Conditions affecting heart function and circulation",
    guidelines: [
      "Monitor blood pressure regularly",
      "Follow prescribed medication schedule",
      "Maintain heart-healthy diet",
      "Track physical activity",
      "Watch for warning signs",
      "Regular medical check-ups"
    ]
  }
];

export const CareGuides = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Care Guides</CardTitle>
            <CardDescription>
              Comprehensive guides and animated videos for managing common conditions requiring collaborative care
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {careGuides.map((guide) => (
            <div key={guide.disease} className="space-y-4">
              <AnimatedCareGuide 
                disease={guide.disease}
                description={guide.description}
              />
              <Card>
                <CardHeader>
                  <CardTitle>{guide.disease}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="guidelines">
                      <AccordionTrigger>Care Guidelines</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-6 space-y-2">
                          {guide.guidelines.map((guideline, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              {guideline}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};