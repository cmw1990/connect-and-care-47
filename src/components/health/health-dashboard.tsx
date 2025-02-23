
import { Card } from "@/components/ui/card";

export function HealthDashboard() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Health Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-medium mb-2">Daily Activity</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Track your daily activities and health metrics here.
          </p>
        </Card>
        <Card className="p-4">
          <h4 className="font-medium mb-2">Medications</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            View and manage your medication schedule.
          </p>
        </Card>
      </div>
    </div>
  );
}
