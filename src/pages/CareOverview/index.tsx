import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', value: 85 },
  { name: 'Tue', value: 83 },
  { name: 'Wed', value: 88 },
  { name: 'Thu', value: 86 },
  { name: 'Fri', value: 85 },
  { name: 'Sat', value: 89 },
  { name: 'Sun', value: 87 },
];

export default function CareOverview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-semibold text-foreground">Care Overview</h1>
        <Button variant="outline">Export Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">Daily Wellness Score</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-medium mb-2">Care Tasks</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Completed Today</span>
              <span className="text-apple-green">8/10</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Upcoming</span>
              <span className="text-apple-orange">4</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Overdue</span>
              <span className="text-apple-red">1</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-medium mb-2">Quick Actions</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full">Schedule Care Visit</Button>
            <Button variant="outline" className="w-full">Update Care Plan</Button>
            <Button variant="outline" className="w-full">Contact Care Team</Button>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
