import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { InsuranceProvider } from "@/types/insurance";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function Network() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: providers } = useQuery({
    queryKey: ['providers', searchTerm],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_providers')
        .select(`
          *,
          insurance_plan_providers!inner(
            network_status
          )
        `)
        .ilike('name', `%${searchTerm}%`)
        .returns<InsuranceProvider[]>();

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search providers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider Name</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Network Status</TableHead>
              <TableHead>Accepting Patients</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers?.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell className="font-medium">{provider.name}</TableCell>
                <TableCell>{provider.specialty}</TableCell>
                <TableCell>
                  <Badge variant={provider.insurance_plan_providers[0]?.network_status === 'in-network' ? 'default' : 'secondary'}>
                    {provider.insurance_plan_providers[0]?.network_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {provider.accepting_new_patients ? 'Yes' : 'No'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
