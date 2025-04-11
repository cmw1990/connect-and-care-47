
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DementiaProfile, DementiaTopicCard } from '@/types/supabase';

interface DementiaSupportProps {
  onProfileUpdate: (profile: Partial<DementiaProfile>) => void;
}

export function DementiaSupport({ onProfileUpdate }: DementiaSupportProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  
  const dementiaStages = [
    { value: 'early', label: 'Early Stage', description: 'Mild memory problems and cognitive changes, but still largely independent.' },
    { value: 'middle', label: 'Middle Stage', description: 'Increasing memory loss, confusion, and need for more daily support.' },
    { value: 'late', label: 'Late Stage', description: 'Severe cognitive decline requiring extensive care and support.' }
  ];
  
  const resourceTopics: DementiaTopicCard[] = [
    {
      id: '1',
      title: 'Communication Tips',
      description: 'Effective ways to maintain connection',
      icon: 'message-square',
      content: 'Speak clearly and slowly, use simple sentences, maintain eye contact, and be patient while waiting for responses.'
    },
    {
      id: '2',
      title: 'Daily Routines',
      description: 'Creating structure and stability',
      icon: 'calendar',
      content: 'Establish consistent daily routines for meals, activities, and rest to provide security and reduce anxiety.'
    },
    {
      id: '3',
      title: 'Memory Aids',
      description: 'Tools to support cognitive function',
      icon: 'brain',
      content: 'Use labeled photos, written reminders, clocks with day/date displays, and color-coding for important items.'
    }
  ];

  const handleStageSelection = (stage: string) => {
    setSelectedStage(stage);
    onProfileUpdate({ stage });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dementia Care Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Select the stage that best describes your care recipient to get specialized companion matches and resources:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {dementiaStages.map((stage) => (
                <Button
                  key={stage.value}
                  variant={selectedStage === stage.value ? "default" : "outline"}
                  className="h-auto flex flex-col items-start p-4 text-left"
                  onClick={() => handleStageSelection(stage.value)}
                >
                  <span className="font-medium">{stage.label}</span>
                  <span className="text-sm text-muted-foreground mt-1">{stage.description}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {selectedStage && (
        <Card>
          <CardHeader>
            <CardTitle>Dementia Care Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="resources">
              <TabsList>
                <TabsTrigger value="resources">Care Tips</TabsTrigger>
                <TabsTrigger value="activities">Suggested Activities</TabsTrigger>
                <TabsTrigger value="community">Community Support</TabsTrigger>
              </TabsList>
              
              <TabsContent value="resources" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {resourceTopics.map((topic) => (
                    <Card key={topic.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{topic.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{topic.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="activities">
                <div className="p-4 text-center text-muted-foreground">
                  Activity recommendations will be personalized after your first companion session.
                </div>
              </TabsContent>
              
              <TabsContent value="community">
                <div className="p-4 text-center text-muted-foreground">
                  Connect with local dementia support groups and resources based on your location.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
