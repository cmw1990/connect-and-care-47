
import React from "react";
import { CaregiverMatcher } from "@/components/caregivers/CaregiverMatcher";

const Caregivers = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Find Your Perfect Caregiver Match</h1>
      <CaregiverMatcher />
    </div>
  );
};

export default Caregivers;
