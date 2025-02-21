import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const weeklyData = [
  { name: 'Sleep', hours: 7.5, quality: 85 },
  { name: 'Activity', hours: 2.3, quality: 75 },
  { name: 'Nutrition', hours: 0, quality: 90 },
  { name: 'Medication', hours: 0, quality: 95 },
  { name: 'Social', hours: 3.2, quality: 80 },
];

export default function CareInsights() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-semibold text-foreground">Care Insights</h1>
        <div className="flex gap-3">
          <Button variant="outline">Weekly</Button>
          <Button variant="outline">Monthly</Button>
          <Button variant="outline">Custom</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">Care Quality Metrics</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="quality" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">Key Observations</h3>
          <div className="space-y-4">
            <div className="p-4 bg-secondary rounded-lg">
              <h4 className="font-medium text-foreground">Sleep Pattern</h4>
              <p className="text-muted-foreground">Average sleep quality has improved by 15% this week</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <h4 className="font-medium text-foreground">Activity Level</h4>
              <p className="text-muted-foreground">Daily activity duration meets recommended guidelines</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <h4 className="font-medium text-foreground">Medication Adherence</h4>
              <p className="text-muted-foreground">Perfect adherence to medication schedule maintained</p>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
