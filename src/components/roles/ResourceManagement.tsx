import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Resource {
  id: string;
  resource_type: string;
  resource_name: string;
  quantity: number;
  unit: string;
  minimum_threshold: number;
  status: string;
}

export const ResourceManagement = ({ facilityId }: { facilityId: string }) => {
  const { data: resources, isLoading } = useQuery({
    queryKey: ['facility-resources', facilityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('care_home_resources')
        .select('*')
        .eq('facility_id', facilityId)
        .order('resource_type', { ascending: true });

      if (error) throw error;
      return data as Resource[];
    },
  });

  if (isLoading) {
    return <div>Loading resources...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Resource Management</CardTitle>
        <Package className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resources?.map((resource) => (
            <div
              key={resource.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">{resource.resource_name}</p>
                <p className="text-sm text-muted-foreground">
                  {resource.resource_type}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm">
                  {resource.quantity} {resource.unit}
                </p>
                {resource.quantity <= resource.minimum_threshold && (
                  <div className="flex items-center text-yellow-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span className="text-xs">Low Stock</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};