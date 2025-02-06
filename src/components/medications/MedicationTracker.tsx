
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Check, Pill, Upload } from "lucide-react";
import { MedicationVerificationHistory } from "./MedicationVerificationHistory";
import { MedicationVerificationSettings } from "./MedicationVerificationSettings";

interface MedicationTrackerProps {
  groupId: string;
  medicationTaken: boolean;
  onMedicationStatusChange: (taken: boolean) => void;
}

export const MedicationTracker = ({ 
  groupId,
  medicationTaken, 
  onMedicationStatusChange 
}: MedicationTrackerProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [sideEffects, setSideEffects] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const handlePhotoVerification = async (file: File) => {
    try {
      setUploading(true);
      
      // Upload photo to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${groupId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('medication_verification')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('medication_verification')
        .getPublicUrl(filePath);

      // Create verification record
      const { error: verificationError } = await supabase
        .from('medication_verifications')
        .insert({
          group_id: groupId,
          photo_url: publicUrl,
          verification_time: new Date().toISOString(),
          status: 'pending',
          symptoms: symptoms,
          side_effects: sideEffects,
          notes: notes
        });

      if (verificationError) throw verificationError;

      toast({
        title: "Success",
        description: "Medication verification photo uploaded successfully",
      });

      onMedicationStatusChange(true);
      setIsVerifying(false);
      setSymptoms([]);
      setSideEffects([]);
      setNotes("");
    } catch (error) {
      console.error('Error uploading verification:', error);
      toast({
        title: "Error",
        description: "Failed to upload verification photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medication Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="medicationTaken">Have you taken your medications today?</Label>
            <Switch
              id="medicationTaken"
              checked={medicationTaken}
              onCheckedChange={onMedicationStatusChange}
            />
          </div>

          {medicationTaken ? (
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">
                Medication taken for today
              </span>
            </div>
          ) : isVerifying ? (
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoVerification(file);
                }}
                className="hidden"
                id="camera-input"
              />
              <div className="space-y-2">
                <Label htmlFor="symptoms">Any Symptoms?</Label>
                <Textarea
                  id="symptoms"
                  value={symptoms.join(", ")}
                  onChange={(e) => setSymptoms(e.target.value.split(",").map(s => s.trim()))}
                  placeholder="Enter symptoms separated by commas"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sideEffects">Side Effects</Label>
                <Textarea
                  id="sideEffects"
                  value={sideEffects.join(", ")}
                  onChange={(e) => setSideEffects(e.target.value.split(",").map(s => s.trim()))}
                  placeholder="Enter side effects separated by commas"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                />
              </div>
              <label htmlFor="camera-input">
                <Button variant="outline" className="w-full" disabled={uploading}>
                  <Camera className="mr-2 h-4 w-4" />
                  {uploading ? "Uploading..." : "Take Verification Photo"}
                </Button>
              </label>
            </div>
          ) : (
            <Button 
              onClick={() => setIsVerifying(true)}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Verify Medication
            </Button>
          )}
        </CardContent>
      </Card>

      <MedicationVerificationSettings groupId={groupId} />
      <MedicationVerificationHistory groupId={groupId} />
    </div>
  );
};
