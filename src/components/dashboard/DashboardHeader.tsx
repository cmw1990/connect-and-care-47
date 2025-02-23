
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
        <p className="text-muted-foreground">
          Here's an overview of your care dashboard
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button>View Calendar</Button>
      </div>
    </div>
  );
}
