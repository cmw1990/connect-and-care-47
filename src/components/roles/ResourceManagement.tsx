import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CareHomeResource } from "@/types/care-home";
import { useToast } from "@/hooks/use-toast";

export const ResourceManagement = ({ facilityId }: { facilityId: string }) => {
  const [resources, setResources] = useState<CareHomeResource[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { data, error } = await supabase
          .from('care_home_resources')
          .select('*')
          .eq('facility_id', facilityId);

        if (error) throw error;
        setResources(data as CareHomeResource[]);
      } catch (error) {
        console.error('Error fetching resources:', error);
        toast({
          title: "Error",
          description: "Failed to load facility resources",
          variant: "destructive",
        });
      }
    };

    fetchResources();
  }, [facilityId, toast]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Facility Resources</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};