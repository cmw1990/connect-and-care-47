import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, AlertTriangle, Activity, Heart } from "lucide-react";
import { format } from "date-fns";
import { Tables, Json } from "@/integrations/supabase/types";

type PatientCheckIn = Tables<"patient_check_ins">;

interface CheckInQuestion {
  question: string;
  answer?: string;
}

interface ResponseData {
  questions?: string[];
  answers?: Record<string, string>;
  type?: string;
  triggered_at?: string;
  [key: string]: unknown; // Add index signature to make it compatible with Json type
}

export const PatientCheckIn = ({ groupId }: { groupId: string }) => {
  const [activeCheckIn, setActiveCheckIn] = useState<PatientCheckIn | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveCheckIn();
    subscribeToCheckIns();
  }, [groupId]);

  const subscribeToCheckIns = () => {
    const channel = supabase
      .channel('patient-checkins')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patient_check_ins',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          fetchActiveCheckIn();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchActiveCheckIn = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_check_ins')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data && typeof data.response_data === 'object' && data.response_data !== null) {
        setActiveCheckIn(data);
        const responseData = data.response_data as ResponseData;
        const questions = responseData.questions || [];
        const initialAnswers: Record<string, string> = {};
        questions.forEach(q => initialAnswers[q] = '');
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error('Error fetching active check-in:', error);
      toast({
        title: "Error",
        description: "Failed to load check-in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCheckIn = async () => {
    if (!activeCheckIn) return;
    
    try {
      setSubmitting(true);
      const responseData = activeCheckIn.response_data as ResponseData;
      const updatedResponseData: ResponseData = {
        ...responseData,
        answers,
      };

      const { error } = await supabase
        .from('patient_check_ins')
        .update({
          status: 'completed',
          completed_time: new Date().toISOString(),
          response_data: updatedResponseData as Json,
        })
        .eq('id', activeCheckIn.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Check-in completed successfully",
      });

      setActiveCheckIn(null);
      setAnswers({});
    } catch (error) {
      console.error('Error submitting check-in:', error);
      toast({
        title: "Error",
        description: "Failed to submit check-in",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmergency = async () => {
    try {
      const { error } = await supabase
        .from('patient_check_ins')
        .insert({
          group_id: groupId,
          check_in_type: 'emergency',
          status: 'urgent',
          scheduled_time: new Date().toISOString(),
          response_data: {
            type: 'emergency_alert',
            triggered_at: new Date().toISOString(),
          },
        });

      if (error) throw error;

      toast({
        title: "Emergency Alert Sent",
        description: "Help is on the way. Stay calm.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      toast({
        title: "Error",
        description: "Failed to send emergency alert. Please try again or call emergency services directly.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Daily Check-in</span>
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center"
              onClick={handleEmergency}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Emergency
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeCheckIn && activeCheckIn.response_data && typeof activeCheckIn.response_data === 'object' && 'questions' in activeCheckIn.response_data ? (
            <div className="space-y-4">
              {(activeCheckIn.response_data.questions as string[]).map((question: string, index: number) => (
                <div key={index}>
                  <label className="block text-sm font-medium mb-2">
                    {question}
                  </label>
                  <Textarea
                    value={answers[question] || ''}
                    onChange={(e) =>
                      setAnswers({ ...answers, [question]: e.target.value })
                    }
                    placeholder="Type your answer here..."
                  />
                </div>
              ))}
              <Button
                className="w-full"
                onClick={handleSubmitCheckIn}
                disabled={submitting}
              >
                <Check className="mr-2 h-4 w-4" />
                Complete Check-in
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">No Active Check-ins</p>
              <p className="text-gray-500">
                You're all caught up! Your next check-in will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Activity Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Last Check-in</p>
              <p className="font-medium">
                {format(new Date(), 'h:mm a')}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Next Check-in</p>
              <p className="font-medium">
                {format(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 'h:mm a')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};