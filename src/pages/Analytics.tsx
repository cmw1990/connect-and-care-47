
import React from "react";
import { CareMetrics } from "@/components/analytics/CareMetrics";
import { CareAnalyticsDashboard } from "@/components/analytics/CareAnalyticsDashboard";

const Analytics = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Care Analytics Dashboard</h1>
      
      <CareMetrics groupId="default" />
      <CareAnalyticsDashboard groupId="default" />
    </div>
  );
};

export default Analytics;
