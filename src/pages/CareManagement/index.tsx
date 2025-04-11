
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Users, 
  Heart 
} from "lucide-react";

// Care tasks data
const careTasks = [
  { 
    id: "task1", 
    title: "Medication Reminder", 
    description: "Take blood pressure medication",
    status: "completed",
    dueDate: "2025-04-11T09:00:00", 
    assignedTo: "John Doe"
  },
  { 
    id: "task2", 
    title: "Doctor Appointment", 
    description: "Regular checkup with Dr. Smith",
    status: "upcoming",
    dueDate: "2025-04-15T14:30:00", 
    assignedTo: "Sarah Johnson"
  },
  { 
    id: "task3", 
    title: "Physical Therapy", 
    description: "Knee rehabilitation exercises",
    status: "overdue",
    dueDate: "2025-04-10T11:00:00", 
    assignedTo: "Michael Brown"
  },
  { 
    id: "task4", 
    title: "Grocery Shopping", 
    description: "Purchase fresh fruits and vegetables",
    status: "upcoming",
    dueDate: "2025-04-12T10:00:00", 
    assignedTo: "Emily Wilson"
  }
];

// Care plans data
const carePlans = [
  {
    id: "plan1",
    title: "Diabetes Management",
    lastUpdated: "2025-03-28",
    provider: "Dr. Jessica Reynolds",
    status: "active"
  },
  {
    id: "plan2",
    title: "Post-Surgery Recovery",
    lastUpdated: "2025-04-05",
    provider: "Dr. Mark Thompson",
    status: "active"
  },
  {
    id: "plan3",
    title: "Physical Rehabilitation",
    lastUpdated: "2025-02-15",
    provider: "Dr. Lisa Cooper",
    status: "completed"
  }
];

export default function CareManagement() {
  const [activeTab, setActiveTab] = useState("tasks");

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'upcoming':
        return "bg-blue-100 text-blue-800";
      case 'overdue':
        return "bg-red-100 text-red-800";
      case 'active':
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground">Care Management</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-medium">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Completed Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {careTasks.filter(task => task.status === 'completed').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-medium">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {careTasks.filter(task => task.status === 'upcoming').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-medium">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Overdue Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {careTasks.filter(task => task.status === 'overdue').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-1/3">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="plans">Care Plans</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          <div className="space-y-4">
            {careTasks.map(task => (
              <Card key={task.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{task.title}</h3>
                        <p className="text-muted-foreground">{task.description}</p>
                      </div>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    <div className="flex items-center mt-4 space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(task.dueDate)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(task.dueDate)}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {task.assignedTo}
                      </div>
                    </div>
                  </div>
                  <div className="flex p-4 bg-muted md:flex-col md:justify-center gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Complete</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="plans" className="mt-6">
          <div className="space-y-4">
            {carePlans.map(plan => (
              <Card key={plan.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{plan.title}</h3>
                        <p className="text-muted-foreground">{plan.provider}</p>
                      </div>
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status}
                      </Badge>
                    </div>
                    <div className="flex items-center mt-4 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 mr-1" />
                      Last updated: {plan.lastUpdated}
                    </div>
                  </div>
                  <div className="flex p-4 bg-muted md:flex-col md:justify-center gap-2">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="ghost" size="sm">Update</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <FileText className="h-16 w-16 text-primary mb-4" />
                <h3 className="font-medium text-lg">Care Instructions</h3>
                <p className="text-muted-foreground text-sm mt-2">
                  Daily care instructions and guidelines
                </p>
                <Button variant="outline" className="mt-4">View Document</Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Heart className="h-16 w-16 text-red-500 mb-4" />
                <h3 className="font-medium text-lg">Health Summary</h3>
                <p className="text-muted-foreground text-sm mt-2">
                  Overall health status and vital trends
                </p>
                <Button variant="outline" className="mt-4">View Document</Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Users className="h-16 w-16 text-blue-500 mb-4" />
                <h3 className="font-medium text-lg">Care Team Contact</h3>
                <p className="text-muted-foreground text-sm mt-2">
                  Contact information for your care providers
                </p>
                <Button variant="outline" className="mt-4">View Document</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
