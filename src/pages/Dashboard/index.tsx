import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-semibold text-foreground">Dashboard</h1>
        <ThemeSwitcher />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-medium mb-2">Care Overview</h3>
          <p className="text-muted-foreground mb-4">Quick summary of care activities and status</p>
          <Button variant="outline" className="w-full">View Details</Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-medium mb-2">Health Monitoring</h3>
          <p className="text-muted-foreground mb-4">Track vital signs and health metrics</p>
          <Button variant="outline" className="w-full">View Details</Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-medium mb-2">Medications</h3>
          <p className="text-muted-foreground mb-4">Manage medications and schedules</p>
          <Button variant="outline" className="w-full">View Details</Button>
        </Card>
      </div>
    </motion.div>
  );
}
