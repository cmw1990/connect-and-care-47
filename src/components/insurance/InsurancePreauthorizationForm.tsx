import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

interface InsurancePreauthorizationFormProps {
  insuranceId: string;
}

interface Preauthorization {
  id: string;
  insurance_id: string;
  service_type: string;
  status: 'pending' | 'approved' | 'denied';
  supporting_documents: {
    notes?: string;
  };
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PreauthorizationInsert extends Omit<Preauthorization, 'id' | 'created_at' | 'updated_at'> {}

export const InsurancePreauthorizationForm = ({ insuranceId }: InsurancePreauthorizationFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState<Date>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const insertData: PreauthorizationInsert = {
        insurance_id: insuranceId,
        service_type: serviceType,
        status: 'pending',
        supporting_documents: { notes },
        expires_at: date?.toISOString() || null
      };

      const { error } = await supabase
        .from('insurance_preauthorizations')
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Preauthorization request submitted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['preauthorizations'] });
      setServiceType("");
      setNotes("");
      setDate(undefined);
    } catch (error) {
      console.error('Error submitting preauthorization:', error);
      toast({
        title: "Error",
        description: "Failed to submit preauthorization request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-white">Request Preauthorization</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="serviceType" className="dark:text-gray-300">Service Type</label>
            <Input
              id="serviceType"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="Enter service type"
              required
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <label className="dark:text-gray-300">Desired Service Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal dark:bg-gray-700 dark:text-white dark:border-gray-600",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 dark:bg-gray-800">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="dark:bg-gray-800"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="dark:text-gray-300">Additional Notes</label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional information"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full dark:bg-primary dark:text-white" 
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
