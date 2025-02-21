import React from "react";
import { CaregiverMatcher } from "@/components/caregivers/CaregiverMatcher";
import { DementiaAssessment } from "@/components/caregivers/DementiaAssessment";
import { DementiaSupport } from "@/components/caregivers/DementiaSupport";
import Jobs from "@/pages/caregivers/Jobs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const Caregivers = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          Find Your Perfect Caregiver Match
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Our intelligent matching system helps you connect with qualified caregivers 
          who meet your specific needs and preferences.
        </p>
      </motion.div>
      
      <Tabs defaultValue="matching" className="space-y-6">
        <TabsList className="bg-primary-50/50 p-1 dark:bg-primary-950/50">
          <TabsTrigger 
            value="matching"
            className="data-[state=active]:bg-white data-[state=active]:text-primary-600 dark:data-[state=active]:bg-primary-900"
          >
            Caregiver Matching
          </TabsTrigger>
          <TabsTrigger 
            value="jobs"
            className="data-[state=active]:bg-white data-[state=active]:text-primary-600 dark:data-[state=active]:bg-primary-900"
          >
            Job Opportunities
          </TabsTrigger>
          <TabsTrigger 
            value="dementia"
            className="data-[state=active]:bg-white data-[state=active]:text-primary-600 dark:data-[state=active]:bg-primary-900"
          >
            Dementia Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matching" className="space-y-4">
          <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl shadow-sm dark:from-primary-950/50 dark:to-background">
            <CaregiverMatcher />
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl shadow-sm dark:from-primary-950/50 dark:to-background">
            <Jobs />
          </div>
        </TabsContent>

        <TabsContent value="dementia" className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 lg:grid-cols-2"
          >
            <div className="glass-card p-6 rounded-xl">
              <DementiaAssessment 
                onAssessmentComplete={(assessment) => {
                  console.log('Assessment completed:', assessment);
                }}
              />
            </div>
            <div className="glass-card p-6 rounded-xl">
              <DementiaSupport 
                onProfileUpdate={(profile) => {
                  console.log('Profile updated:', profile);
                }}
              />
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Caregivers;
