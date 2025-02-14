
import { useEffect } from "react";
import { useNavigate, Outlet, NavLink } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Insurance() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: insurancePlans } = useQuery({
    queryKey: ['insurancePlans'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_insurance')
        .select(`
          *,
          insurance_plan:insurance_plan_id (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (!insurancePlans?.length) {
      toast({
        title: "No Insurance Plans Found",
        description: "Please add your insurance information to continue.",
      });
      navigate("/insurance/setup");
    }
  }, [insurancePlans, navigate, toast]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Insurance Management</h1>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview" asChild>
              <NavLink to="/insurance">Overview</NavLink>
            </TabsTrigger>
            <TabsTrigger value="claims" asChild>
              <NavLink to="/insurance/claims">Claims</NavLink>
            </TabsTrigger>
            <TabsTrigger value="coverage" asChild>
              <NavLink to="/insurance/coverage">Coverage</NavLink>
            </TabsTrigger>
            <TabsTrigger value="network" asChild>
              <NavLink to="/insurance/network">Provider Network</NavLink>
            </TabsTrigger>
            <TabsTrigger value="documents" asChild>
              <NavLink to="/insurance/documents">Documents</NavLink>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <Outlet />
    </div>
  );
}
