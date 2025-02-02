import React from "react";
import { UpcomingSchedule } from "@/components/schedule/UpcomingSchedule";

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome to Care Companion</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingSchedule />
      </div>
    </div>
  );
};

export default Index;