
import React from "react";
import { VitalSignsMonitor } from "@/components/health/VitalSignsMonitor";
import { EmergencySOSButton } from "@/components/emergency/EmergencySOSButton";
import { CareAnalyticsDashboard } from "@/components/analytics/CareAnalyticsDashboard";

const Monitoring = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Real-time Monitoring Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmergencySOSButton groupId="default" />
        <VitalSignsMonitor groupId="default" />
      </div>
      
      <CareAnalyticsDashboard groupId="default" />
    </div>
  );
};

export default Monitoring;
