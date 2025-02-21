import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const caregivers = [
  {
    id: 1,
    name: "Lisa Johnson",
    type: "Professional",
    experience: "5 years",
    specialties: ["Elder Care", "Medication Management"],
    availability: "Full-time",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Robert Martinez",
    type: "Family",
    experience: "2 years",
    specialties: ["Personal Care", "Companionship"],
    availability: "Part-time",
    rating: 4.9,
  },
  {
    id: 3,
    name: "Patricia Lee",
    type: "Professional",
    experience: "8 years",
    specialties: ["Dementia Care", "Physical Therapy"],
    availability: "Full-time",
    rating: 4.7,
  },
];

export default function Caregivers() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-semibold text-foreground">Caregivers</h1>
        <div className="flex gap-3">
          <Button variant="outline">Filter</Button>
          <Button>Add Caregiver</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {caregivers.map((caregiver) => (
          <Card key={caregiver.id} className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-lg">
                  {caregiver.name.charAt(0)}
                </div>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{caregiver.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{caregiver.type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {caregiver.experience}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-apple-yellow">★</span>
                    <span className="ml-1">{caregiver.rating}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground mb-2">Specialties:</p>
                  <div className="flex flex-wrap gap-2">
                    {caregiver.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="secondary">{caregiver.availability}</Badge>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">Profile</Button>
                    <Button variant="outline" size="sm">Schedule</Button>
                    <Button size="sm">Contact</Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Active Caregivers</h3>
          <div className="text-3xl font-bold text-apple-blue">12</div>
          <p className="text-sm text-muted-foreground mt-1">Currently on duty</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Total Care Hours</h3>
          <div className="text-3xl font-bold text-apple-green">168</div>
          <p className="text-sm text-muted-foreground mt-1">This week</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Upcoming Shifts</h3>
          <div className="text-3xl font-bold text-apple-orange">8</div>
          <p className="text-sm text-muted-foreground mt-1">Next 24 hours</p>
        </Card>
      </div>
    </motion.div>
  );
}
