
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DementiaProfile } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';
import { safeSupabaseQuery } from '@/utils/supabaseHelpers';
import { supabase } from '@/integrations/supabase/client';

export default function DementiaAssessment() {
  const [profile, setProfile] = useState<Partial<DementiaProfile>>({
    stage: '',
    symptoms: [],
    care_needs: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const symptoms = [
    { id: 'memory_loss', label: 'Memory loss that disrupts daily life' },
    { id: 'planning_challenges', label: 'Challenges in planning or solving problems' },
    { id: 'task_completion', label: 'Difficulty completing familiar tasks' },
    { id: 'time_confusion', label: 'Confusion with time or place' },
    { id: 'visual_problems', label: 'Trouble understanding visual images' },
    { id: 'language_problems', label: 'New problems with words in speaking or writing' },
    { id: 'misplacing', label: 'Misplacing things and losing the ability to retrace steps' },
    { id: 'judgment', label: 'Decreased or poor judgment' },
    { id: 'social_withdrawal', label: 'Withdrawal from work or social activities' },
    { id: 'mood_changes', label: 'Changes in mood and personality' }
  ];

  const careNeeds = [
    { id: 'medication_management', label: 'Medication management' },
    { id: 'meal_preparation', label: 'Meal preparation' },
    { id: 'hygiene_assistance', label: 'Personal hygiene assistance' },
    { id: 'mobility_support', label: 'Mobility support' },
    { id: 'transport', label: 'Transportation assistance' },
    { id: 'companionship', label: 'Social companionship' },
    { id: 'housekeeping', label: 'Housekeeping' }
  ];

  const handleSymptomsChange = (checked: boolean, symptom: string) => {
    if (checked) {
      setProfile(prev => ({
        ...prev,
        symptoms: [...(prev.symptoms || []), symptom]
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        symptoms: (prev.symptoms || []).filter(s => s !== symptom)
      }));
    }
  };

  const handleCareNeedsChange = (checked: boolean, need: string) => {
    if (checked) {
      setProfile(prev => ({
        ...prev,
        care_needs: [...(prev.care_needs || []), need]
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        care_needs: (prev.care_needs || []).filter(n => n !== need)
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit this assessment",
          variant: "destructive"
        });
        return;
      }

      // Using our safe query helper
      const result = await safeSupabaseQuery(
        async () => supabase
          .from('dementia_profiles')
          .insert({
            user_id: user.id,
            stage: profile.stage,
            symptoms: profile.symptoms,
            care_needs: profile.care_needs
          }),
        null
      );

      toast({
        title: "Assessment Submitted",
        description: "Thank you for completing the dementia care assessment. This will help us provide better companion matches."
      });
    } catch (error) {
      console.error("Error submitting dementia assessment:", error);
      toast({
        title: "Submission Error",
        description: "There was a problem submitting your assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dementia Care Assessment</CardTitle>
          <CardDescription>
            This confidential assessment helps us match you with companions who have the right experience for your needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Dementia Stage</h3>
            <RadioGroup
              value={profile.stage}
              onValueChange={(value) => setProfile(prev => ({ ...prev, stage: value }))}
            >
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="early" id="early" />
                  <div className="grid gap-1">
                    <Label htmlFor="early" className="font-medium">Early Stage</Label>
                    <p className="text-sm text-muted-foreground">Mild memory problems and cognitive changes, but still largely independent.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="middle" id="middle" />
                  <div className="grid gap-1">
                    <Label htmlFor="middle" className="font-medium">Middle Stage</Label>
                    <p className="text-sm text-muted-foreground">Increasing memory loss, confusion, and need for more daily support.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="late" id="late" />
                  <div className="grid gap-1">
                    <Label htmlFor="late" className="font-medium">Late Stage</Label>
                    <p className="text-sm text-muted-foreground">Severe cognitive decline requiring extensive care and support.</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Common Symptoms</h3>
            <p className="text-sm text-muted-foreground mb-3">Select all that apply:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {symptoms.map((symptom) => (
                <div key={symptom.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={symptom.id} 
                    checked={(profile.symptoms || []).includes(symptom.id)}
                    onCheckedChange={(checked) => handleSymptomsChange(!!checked, symptom.id)}
                  />
                  <Label htmlFor={symptom.id}>{symptom.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Care Needs</h3>
            <p className="text-sm text-muted-foreground mb-3">Select all that apply:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {careNeeds.map((need) => (
                <div key={need.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={need.id}
                    checked={(profile.care_needs || []).includes(need.id)}
                    onCheckedChange={(checked) => handleCareNeedsChange(!!checked, need.id)}
                  />
                  <Label htmlFor={need.id}>{need.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !profile.stage}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Assessment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
