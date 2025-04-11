
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface AnimatedCareGuideProps {
  disease: string;
  description: string;
  guidelines: string[];
}

export const AnimatedCareGuide: React.FC<AnimatedCareGuideProps> = ({ disease, description, guidelines }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{disease}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Key Guidelines:</h3>
          <ul className="space-y-2">
            {guidelines.slice(0, 3).map((guideline, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-flex items-center justify-center mr-2 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs">
                  {index + 1}
                </span>
                <span className="text-sm">{guideline}</span>
              </li>
            ))}
            {guidelines.length > 3 && (
              <li className="text-sm text-muted-foreground">
                +{guidelines.length - 3} more guidelines
              </li>
            )}
          </ul>
        </div>
        
        <Button variant="outline" className="mt-4 w-full flex items-center justify-between">
          <span>View Full Guide</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
