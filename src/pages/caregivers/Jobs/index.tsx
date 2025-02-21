import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const jobs = [
  {
    id: 1,
    title: "Senior Care Specialist",
    type: "Full-time",
    location: "San Francisco, CA",
    salary: "$25-30/hr",
    requirements: [
      "5+ years experience",
      "CNA certification",
      "Elder care expertise"
    ],
    status: "Active",
    applicants: 12
  },
  {
    id: 2,
    title: "Part-time Caregiver",
    type: "Part-time",
    location: "Remote",
    salary: "$20-25/hr",
    requirements: [
      "2+ years experience",
      "First Aid certification",
      "Flexible schedule"
    ],
    status: "Active",
    applicants: 8
  },
  {
    id: 3,
    title: "Overnight Care Specialist",
    type: "Contract",
    location: "Los Angeles, CA",
    salary: "$28-35/hr",
    requirements: [
      "3+ years experience",
      "Night shift experience",
      "CPR certified"
    ],
    status: "Urgent",
    applicants: 5
  }
];

export default function CaregiverJobs() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-semibold text-foreground">Caregiver Jobs</h1>
        <div className="flex gap-3">
          <Button variant="outline">Filter</Button>
          <Button>Post New Job</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {jobs.map((job) => (
          <Card key={job.id} className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-medium">{job.title}</h3>
                    <Badge variant={job.status === "Urgent" ? "destructive" : "secondary"}>
                      {job.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{job.type}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.salary}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Requirements:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {job.requirements.map((req) => (
                      <li key={req}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col items-end gap-4">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Applicants</div>
                  <div className="text-2xl font-bold text-apple-blue">{job.applicants}</div>
                </div>
                <div className="space-y-2">
                  <Button className="w-full md:w-auto">Apply Now</Button>
                  <Button variant="outline" className="w-full md:w-auto">View Details</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-medium mb-4">Job Posting Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-muted-foreground">Active Listings</div>
            <div className="text-2xl font-bold text-apple-blue">15</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total Applicants</div>
            <div className="text-2xl font-bold text-apple-green">47</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Positions Filled</div>
            <div className="text-2xl font-bold text-apple-orange">8</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
