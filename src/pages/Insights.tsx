
import React from "react";
import { Card } from "@/components/ui/card";
import { Brain, Activity, Heart, TrendingUp } from "lucide-react";

const Insights = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI-Powered Care Insights</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <Brain className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Personalized Recommendations</h3>
          <p className="text-muted-foreground">
            AI-driven care suggestions based on monitored health data and patterns
          </p>
        </Card>

        <Card className="p-6">
          <Activity className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Health Trends</h3>
          <p className="text-muted-foreground">
            Analysis of vital signs and activity patterns over time
          </p>
        </Card>

        <Card className="p-6">
          <Heart className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Wellness Insights</h3>
          <p className="text-muted-foreground">
            Holistic wellness recommendations and lifestyle adjustments
          </p>
        </Card>

        <Card className="p-6">
          <TrendingUp className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
          <p className="text-muted-foreground">
            Monitor improvement and track care goals achievement
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Insights;
