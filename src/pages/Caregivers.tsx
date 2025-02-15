
import React from "react";
import { CaregiverMatcher } from "@/components/caregivers/CaregiverMatcher";
import { DementiaAssessment } from "@/components/caregivers/DementiaAssessment";
import { DementiaSupport } from "@/components/caregivers/DementiaSupport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Caregivers = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Find Your Perfect Caregiver Match</h1>
      
      <Tabs defaultValue="matching" className="space-y-6">
        <TabsList>
          <TabsTrigger value="matching">Caregiver Matching</TabsTrigger>
          <TabsTrigger value="dementia">Dementia Support</TabsTrigger>
        </TabsList>

        <TabsContent value="matching">
          <CaregiverMatcher />
        </TabsContent>

        <TabsContent value="dementia" className="space-y-6">
          <DementiaAssessment 
            onAssessmentComplete={(assessment) => {
              console.log('Assessment completed:', assessment);
            }}
          />
          <DementiaSupport 
            onProfileUpdate={(profile) => {
              console.log('Profile updated:', profile);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Caregivers;
