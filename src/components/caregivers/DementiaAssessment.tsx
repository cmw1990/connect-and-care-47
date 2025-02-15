
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Brain, Calendar, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { DementiaProfile } from "@/types/supabase";

interface DementiaAssessmentProps {
  onAssessmentComplete: (assessment: Partial<DementiaProfile>) => void;
}

export function DementiaAssessment({ onAssessmentComplete }: DementiaAssessmentProps) {
  const [stage, setStage] = useState<'early' | 'middle' | 'late'>('early');
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('dementia_profiles')
        .upsert({
          user_id: user.id,
          stage,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      onAssessmentComplete({ stage });
      
      toast({
        title: "Assessment Saved",
        description: "Your dementia care assessment has been updated",
      });
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error",
        description: "Failed to save assessment",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Dementia Care Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label>Current Stage</Label>
            <RadioGroup
              value={stage}
              onValueChange={(value: 'early' | 'middle' | 'late') => setStage(value)}
              className="grid gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="early" id="early" />
                <Label htmlFor="early">Early Stage</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="middle" id="middle" />
                <Label htmlFor="middle">Middle Stage</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="late" id="late" />
                <Label htmlFor="late">Late Stage</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-between items-center">
            <div className="space-x-2">
              <Button variant="outline" onClick={() => window.print()}>
                <Calendar className="h-4 w-4 mr-2" />
                Print Assessment
              </Button>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Share with Care Team
              </Button>
            </div>
            <Button onClick={handleSubmit}>Save Assessment</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
