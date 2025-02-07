import { motion } from "framer-motion";
import { Calendar, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { VitalSignsMonitor } from "@/components/health/VitalSignsMonitor";
import { QuickActions } from "./QuickActions";
import { CareOverview } from "./CareOverview";
import { RecentActivity } from "./RecentActivity";
import { CareGuideExamples } from "./CareGuideExamples";
import { MedicationReminder } from "@/components/medications/MedicationReminder";
import { CareMetrics } from "@/components/analytics/CareMetrics";
import { EmergencySOSButton } from "@/components/emergency/EmergencySOSButton";
import { TaskScheduler } from "@/components/tasks/TaskScheduler";
import { CareAnalyticsDashboard } from "@/components/analytics/CareAnalyticsDashboard";

interface DashboardContentProps {
  primaryGroup?: {
    id: string;
  } | null;
  upcomingAppointments?: any[];
}

export const DashboardContent = ({ primaryGroup, upcomingAppointments }: DashboardContentProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {primaryGroup?.id && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <EmergencySOSButton groupId={primaryGroup.id} />
            <VitalSignsMonitor groupId={primaryGroup.id} />
          </div>
          <CareAnalyticsDashboard groupId={primaryGroup.id} />
        </>
      )}

      {upcomingAppointments && upcomingAppointments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Appointments
          </h3>
          <div className="space-y-2">
            {upcomingAppointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <p className="font-medium">{appointment.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.scheduled_time).toLocaleString()}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/appointments/${appointment.id}`)}>
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <QuickActions />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {primaryGroup?.id ? (
            <>
              <CareOverview groupId={primaryGroup.id} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <MedicationReminder groupId={primaryGroup.id} />
                <TaskScheduler groupId={primaryGroup.id} />
              </div>
              <div className="mt-6">
                <CareMetrics groupId={primaryGroup.id} />
              </div>
            </>
          ) : (
            <motion.div 
              className="text-center py-8 bg-white rounded-lg shadow-sm"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Care Group Found</h3>
              <p className="text-muted-foreground mb-4">
                Join a care group to access check-ins and other features
              </p>
              <Button 
                onClick={() => navigate('/groups')}
                className="transition-all duration-300 hover:scale-105"
              >
                Find or Create a Care Group
              </Button>
            </motion.div>
          )}
        </div>
        
        <div className="space-y-6">
          <RecentActivity groupId={primaryGroup?.id} />
          <CareGuideExamples />
        </div>
      </div>
    </div>
  );
};