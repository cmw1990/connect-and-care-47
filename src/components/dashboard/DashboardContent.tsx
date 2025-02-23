
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function DashboardContent() {
  return (
    <div className="grid gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">Schedule Visit</Button>
            <Button variant="outline" className="w-full justify-start">Track Medication</Button>
            <Button variant="outline" className="w-full justify-start">Contact Support</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
