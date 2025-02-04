import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";

interface AnimatedGuideProps {
  disease: string;
  description: string;
}

export const AnimatedCareGuide = ({ disease, description }: AnimatedGuideProps) => {
  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          {disease} Care Guide
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          <Play className="h-12 w-12 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};