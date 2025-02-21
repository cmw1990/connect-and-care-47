import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const alerts = [
  {
    id: 1,
    type: "urgent",
    title: "Medication Alert",
    message: "Blood pressure medication due in 30 minutes",
    time: "10:30 AM",
  },
  {
    id: 2,
    type: "warning",
    title: "Health Monitor",
    message: "Heart rate slightly elevated",
    time: "9:45 AM",
  },
  {
    id: 3,
    type: "info",
    title: "Appointment Reminder",
    message: "Doctor's appointment tomorrow at 2 PM",
    time: "9:00 AM",
  },
];

export default function CareAlerts() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-semibold text-foreground">Care Alerts</h1>
        <div className="flex gap-3">
          <Button variant="outline">Mark All Read</Button>
          <Button>Configure Alerts</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {alerts.map((alert) => (
          <Card
            key={alert.id}
            className="p-4 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-2 h-2 mt-2 rounded-full ${
                  alert.type === "urgent"
                    ? "bg-apple-red"
                    : alert.type === "warning"
                    ? "bg-apple-orange"
                    : "bg-apple-blue"
                }`}
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">{alert.title}</h3>
                  <Badge
                    variant={
                      alert.type === "urgent"
                        ? "destructive"
                        : alert.type === "warning"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {alert.type}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{alert.message}</p>
                <span className="text-sm text-muted-foreground">{alert.time}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">Dismiss</Button>
              <Button variant="outline" size="sm">View</Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-medium mb-4">Alert Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Push Notifications</h3>
              <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
            </div>
            <Button variant="outline">Configure</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">Get alerts in your inbox</p>
            </div>
            <Button variant="outline">Configure</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Alert Priority</h3>
              <p className="text-sm text-muted-foreground">Set alert importance levels</p>
            </div>
            <Button variant="outline">Configure</Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
