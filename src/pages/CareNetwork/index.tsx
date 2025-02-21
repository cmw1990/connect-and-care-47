import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

const careTeam = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    role: "Primary Care Physician",
    availability: "Available",
    lastContact: "2 hours ago",
    image: "/avatars/doctor1.png"
  },
  {
    id: 2,
    name: "Michael Brown",
    role: "Care Coordinator",
    availability: "Busy",
    lastContact: "1 day ago",
    image: "/avatars/coordinator1.png"
  },
  {
    id: 3,
    name: "Emma Wilson",
    role: "Physical Therapist",
    availability: "Available",
    lastContact: "3 hours ago",
    image: "/avatars/therapist1.png"
  }
];

export default function CareNetwork() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-semibold text-foreground">Care Network</h1>
        <Button>Add Team Member</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {careTeam.map((member) => (
          <Card key={member.id} className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  {member.name.charAt(0)}
                </div>
              </Avatar>
              <div>
                <h3 className="font-medium">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-2 h-2 rounded-full ${
                    member.availability === "Available" ? "bg-apple-green" : "bg-apple-orange"
                  }`} />
                  <span className="text-sm">{member.availability}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Last contact: {member.lastContact}
                </p>
              </div>
            </div>
            <div className="mt-4 space-x-2">
              <Button variant="outline" size="sm">Message</Button>
              <Button variant="outline" size="sm">Schedule</Button>
              <Button variant="outline" size="sm">Profile</Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-medium mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button variant="outline" className="w-full">Schedule Team Meeting</Button>
            <Button variant="outline" className="w-full">Update Care Plan</Button>
            <Button variant="outline" className="w-full">Share Documents</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-medium mb-4">Network Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Active Team Members</span>
              <span className="font-medium">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Pending Tasks</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Recent Updates</span>
              <span className="font-medium">5</span>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
