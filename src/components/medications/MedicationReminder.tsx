import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { supabase } from "@/integrations/supabase/client";

interface MedicationReminderProps {
  groupId: string;
}

export const MedicationReminder = ({ groupId }: MedicationReminderProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handlePhotoVerification = async (file: File) => {
    try {
      const { data, error } = await supabase.storage
        .from('medication_verification')
        .upload(`${groupId}/${Date.now()}.jpg`, file);

      if (error) throw error;

      await supabase
        .from('patient_check_ins')
        .insert({
          group_id: groupId,
          check_in_type: 'medication',
          status: 'completed',
          response_data: {
            medication_taken: true,
            photo_url: data.path
          }
        });

      toast({
        title: t('medicationVerification'),
        description: t('takeMedication'),
      });
    } catch (error) {
      console.error('Error uploading verification:', error);
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('medicationReminder')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isVerifying ? (
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
            <label htmlFor="camera-input">
              <Button variant="outline" className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                {t('medicationVerification')}
              </Button>
            </label>
          </div>
        ) : (
          <Button 
            onClick={() => setIsVerifying(true)}
            className="w-full"
          >
            <Check className="mr-2 h-4 w-4" />
            {t('takeMedication')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};