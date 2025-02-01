import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit } from "lucide-react";

interface PatientInfoCardProps {
  groupId: string;
  patientInfo?: {
    basic_info: {
      name?: string;
      age?: string;
      condition?: string;
    };
    diseases?: string[];
    medicines?: {
      name: string;
      dosage: string;
      frequency: string;
    }[];
    care_tips?: string[];
  };
}

export const PatientInfoCard = ({ groupId, patientInfo }: PatientInfoCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: patientInfo?.basic_info?.name || "",
    age: patientInfo?.basic_info?.age || "",
    condition: patientInfo?.basic_info?.condition || "",
    diseases: patientInfo?.diseases?.join(", ") || "",
    careTips: patientInfo?.care_tips?.join("\n") || "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('patient_info')
        .upsert({
          group_id: groupId,
          basic_info: {
            name: formData.name,
            age: formData.age,
            condition: formData.condition,
          },
          diseases: formData.diseases.split(",").map(d => d.trim()),
          care_tips: formData.careTips.split("\n").map(t => t.trim()),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient information updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating patient info:', error);
      toast({
        title: "Error",
        description: "Failed to update patient information",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Patient Information</CardTitle>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Patient Information</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="condition">Current Condition</Label>
                  <Textarea
                    id="condition"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="diseases">Diseases (comma-separated)</Label>
                  <Input
                    id="diseases"
                    value={formData.diseases}
                    onChange={(e) => setFormData({ ...formData, diseases: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="careTips">Care Tips (one per line)</Label>
                  <Textarea
                    id="careTips"
                    value={formData.careTips}
                    onChange={(e) => setFormData({ ...formData, careTips: e.target.value })}
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full">Save Changes</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Basic Information</h4>
            <p>Name: {patientInfo?.basic_info?.name || "Not specified"}</p>
            <p>Age: {patientInfo?.basic_info?.age || "Not specified"}</p>
            <p>Current Condition: {patientInfo?.basic_info?.condition || "Not specified"}</p>
          </div>
          <div>
            <h4 className="font-medium">Diseases</h4>
            {patientInfo?.diseases && patientInfo.diseases.length > 0 ? (
              <ul className="list-disc pl-5">
                {patientInfo.diseases.map((disease, index) => (
                  <li key={index}>{disease}</li>
                ))}
              </ul>
            ) : (
              <p>No diseases listed</p>
            )}
          </div>
          <div>
            <h4 className="font-medium">Care Tips</h4>
            {patientInfo?.care_tips && patientInfo.care_tips.length > 0 ? (
              <ul className="list-disc pl-5">
                {patientInfo.care_tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            ) : (
              <p>No care tips listed</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};