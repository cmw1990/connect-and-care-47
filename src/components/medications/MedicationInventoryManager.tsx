
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  PackageCheck,
  PackagePlus,
  Calendar,
  Pill
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

interface MedicationInventoryManagerProps {
  groupId: string;
}

export const MedicationInventoryManager = ({ groupId }: MedicationInventoryManagerProps) => {
  const { data: inventory, isLoading } = useQuery({
    queryKey: ['medicationInventory', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medication_inventory')
        .select(`
          *,
          medication_schedules (
            medication_name,
            dosage
          )
        `)
        .eq('group_id', groupId);

      if (error) throw error;
      return data;
    }
  });

  const handleRefill = async (inventoryId: string, quantity: number) => {
    const { error } = await supabase
      .from('medication_inventory')
      .update({
        current_quantity: quantity,
        last_refill_date: new Date().toISOString()
      })
      .eq('id', inventoryId);

    if (error) {
      console.error('Error updating inventory:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Medication Inventory</h3>
        <Button>
          <PackagePlus className="h-4 w-4 mr-2" />
          Add Inventory
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {inventory?.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    {item.medication_schedules.medication_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {item.medication_schedules.dosage}
                  </p>
                </div>

                {item.current_quantity <= item.reorder_threshold && (
                  <div className="flex items-center text-yellow-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Low Stock</span>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Current Stock:</span>
                  <span>{item.current_quantity} units</span>
                </div>
                <Progress 
                  value={(item.current_quantity / (item.reorder_threshold * 2)) * 100} 
                  className="h-2"
                />
              </div>

              <div className="mt-4 text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Last Refill: {format(new Date(item.last_refill_date), 'MMM d, yyyy')}
                </div>
                {item.next_refill_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Next Refill: {format(new Date(item.next_refill_date), 'MMM d, yyyy')}
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline"
                  onClick={() => handleRefill(item.id, item.current_quantity + 30)}
                >
                  <PackageCheck className="h-4 w-4 mr-2" />
                  Record Refill
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
