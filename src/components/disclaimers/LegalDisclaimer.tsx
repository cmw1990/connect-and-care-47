
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Disclaimer {
  id: string;
  type: string;
  title: string;
  content: string;
}

export const LegalDisclaimer = ({ type }: { type: string }) => {
  const { data: disclaimer } = useQuery<Disclaimer>({
    queryKey: ['disclaimers', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_disclaimers')
        .select('*')
        .eq('type', type)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (!disclaimer) return null;

  return (
    <Alert variant="destructive" className="my-4">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>{disclaimer.title}</AlertTitle>
      <AlertDescription>
        {disclaimer.content}
      </AlertDescription>
    </Alert>
  );
};
