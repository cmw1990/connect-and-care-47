import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Smile, Frown, HeartPulse, Heart, Angry, Meh, Bot } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CareAssistant } from "@/components/ai/CareAssistant";
import { notificationService } from "@/services/NotificationService";
import { CompanionMatcher } from "@/components/companions/CompanionMatcher";
import { CaregiverMatcher } from "@/components/caregivers/CaregiverMatcher";

export const MoodSupport = () => {
  const [journalEntry, setJournalEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    // Initialize notifications when component mounts
    notificationService.initializePushNotifications();
    // Schedule next day's mood check reminder
    notificationService.scheduleMoodCheckReminder();
  }, []);

  const moods = [
    { icon: Smile, label: "Happy", color: "text-green-500" },
    { icon: Frown, label: "Sad", color: "text-blue-500" },
    { icon: Heart, label: "Grateful", color: "text-red-500" },
    { icon: HeartPulse, label: "Anxious", color: "text-purple-500" },
    { icon: Angry, label: "Frustrated", color: "text-orange-500" },
    { icon: Meh, label: "Tired", color: "text-gray-500" },
  ];

  const handleJournalSubmit = async () => {
    if (!journalEntry.trim()) {
      toast({
        title: t("Error"),
        description: t("Please write something in your journal"),
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: t("Error"),
        description: t("Please sign in to save journal entries"),
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("caregiver_journals")
        .insert({
          content: journalEntry,
          mood: selectedMood,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: t("Success"),
        description: t("Journal entry saved successfully"),
      });

      // Schedule next mood check reminder
      await notificationService.scheduleMoodCheckReminder();

      setJournalEntry("");
      setSelectedMood(null);
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({
        title: t("Error"),
        description: t("Failed to save journal entry"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">{t("Caregiver Mood Support")}</h1>
      
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              {t("Mood Journal")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 md:gap-3">
              {moods.map((mood) => (
                <Button
                  key={mood.label}
                  variant={selectedMood === mood.label ? "default" : "outline"}
                  className="flex items-center gap-2"
                  onClick={() => setSelectedMood(mood.label)}
                >
                  <mood.icon className={`h-4 w-4 ${mood.color}`} />
                  {t(mood.label)}
                </Button>
              ))}
            </div>
            <Textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder={t("Write about your feelings and experiences...")}
              className="min-h-[150px]"
            />
            <Button onClick={handleJournalSubmit} className="w-full">
              {t("Save Journal Entry")}
            </Button>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              {t("AI Care Assistant")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CareAssistant />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <CaregiverMatcher />
        <CompanionMatcher />
      </div>
    </div>
  );
};

export default MoodSupport;