
import React from "react";
import { Check, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscriptionPlan } from "./types";

interface FacilitySubscriptionPlansProps {
  plans: SubscriptionPlan[];
  onSelectPlan: (plan: SubscriptionPlan) => void;
  currentPlanId?: string;
}

export const FacilitySubscriptionPlans: React.FC<FacilitySubscriptionPlansProps> = ({
  plans,
  onSelectPlan,
  currentPlanId,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`relative ${
            plan.name === "Premium"
              ? "border-[#9b87f5] shadow-lg transform hover:-translate-y-1 transition-all"
              : "hover:shadow-md transition-shadow"
          }`}
        >
          {plan.name === "Premium" && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#9b87f5] text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {plan.name}
              {plan.name !== "Basic" && (
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
              )}
            </CardTitle>
            <CardDescription>
              <span className="text-2xl font-bold">
                ${plan.price}
              </span>
              /month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => onSelectPlan(plan)}
              className={`w-full ${
                plan.name === "Premium"
                  ? "bg-[#9b87f5] hover:bg-[#7E69AB]"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
              disabled={currentPlanId === plan.id}
            >
              {currentPlanId === plan.id ? "Current Plan" : "Select Plan"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
