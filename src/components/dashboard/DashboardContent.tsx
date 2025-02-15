
import { motion } from "framer-motion";
import { Calendar, Activity, Plus } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardContentProps {
  primaryGroup?: {
    id: string;
  } | null;
  upcomingAppointments?: any[];
}

export const DashboardContent = ({ primaryGroup, upcomingAppointments }: DashboardContentProps) => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {primaryGroup?.id && (
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <EmergencySOSButton groupId={primaryGroup.id} />
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                <VitalSignsMonitor groupId={primaryGroup.id} />
              </CardContent>
            </Card>
          </div>
          <Card className="mb-8 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <CareAnalyticsDashboard groupId={primaryGroup.id} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {upcomingAppointments && upcomingAppointments.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div 
                    key={appointment.id}
                    className="flex justify-between items-center p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium">{appointment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.scheduled_time).toLocaleString()}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/appointments/${appointment.id}`)}
                      className="hover:translate-x-1 transition-transform"
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <QuickActions />
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="md:col-span-2 space-y-8">
          {primaryGroup?.id ? (
            <>
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <CareOverview groupId={primaryGroup.id} />
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <MedicationReminder groupId={primaryGroup.id} />
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <TaskScheduler groupId={primaryGroup.id} />
                  </CardContent>
                </Card>
              </div>
              
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <CareMetrics groupId={primaryGroup.id} />
                </CardContent>
              </Card>
            </>
          ) : (
            <motion.div 
              className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-8 text-center"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Activity className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">No Care Group Found</h3>
              <p className="text-muted-foreground mb-6">
                Join a care group to access check-ins and other features
              </p>
              <Button 
                onClick={() => navigate('/groups')}
                size="lg"
                className="hover:scale-105 transition-transform"
              >
                <Plus className="mr-2 h-4 w-4" />
                Find or Create a Care Group
              </Button>
            </motion.div>
          )}
        </motion.div>
        
        <motion.div variants={itemVariants} className="space-y-6">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <RecentActivity groupId={primaryGroup?.id} />
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <CareGuideExamples />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
