
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

interface InsurancePreauthorizationFormProps {
  insuranceId: string;
}

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
      const { error } = await supabase
        .from('insurance_preauthorizations')
        .insert({
          insurance_id: insuranceId,
          service_type: serviceType,
          status: 'pending',
          supporting_documents: { notes },
          expires_at: date?.toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Preauthorization request submitted successfully",
      });

      queryClient.invalidateQueries(['preauthorizations']);
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
    <Card>
      <CardHeader>
        <CardTitle>Request Preauthorization</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="serviceType">Service Type</label>
            <Input
              id="serviceType"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="Enter service type"
              required
            />
          </div>

          <div className="space-y-2">
            <label>Desired Service Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes">Additional Notes</label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional information"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
