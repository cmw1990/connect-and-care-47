import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CareHomeResource } from "@/types/care-home";
import { useToast } from "@/hooks/use-toast";

export const ResourceManagement = ({ facilityId }: { facilityId: string }) => {
  const [resources, setResources] = useState<CareHomeResource[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { data, error } = await supabase
          .from('care_home_resources')
          .select('*')
          .eq('facility_id', facilityId);

        if (error) throw error;

        // Ensure type safety by mapping the response
        const typedResources: CareHomeResource[] = data.map(item => ({
          id: item.id,
          facility_id: item.facility_id,
          resource_type: item.resource_type,
          resource_name: item.resource_name,
          quantity: item.quantity,
          unit: item.unit,
          minimum_threshold: item.minimum_threshold,
          status: item.status,
          last_restocked: item.last_restocked,
          notes: item.notes
        }));

        setResources(typedResources);
      } catch (error) {
        console.error('Error fetching resources:', error);
        toast({
          title: "Error",
          description: "Failed to load facility resources",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [facilityId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Facility Resources</CardTitle>
        </CardHeader>
        <CardContent>
          {resources.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No resources available</p>
          ) : (
            <div className="space-y-4">
              {resources.map((resource) => (
                <Card key={resource.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{resource.resource_name}</h3>
                        <p className="text-sm text-gray-500">{resource.resource_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {resource.quantity} {resource.unit}
                        </p>
                        <p className={`text-sm ${
                          resource.quantity <= resource.minimum_threshold 
                            ? 'text-red-500' 
                            : 'text-green-500'
                        }`}>
                          {resource.status}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};