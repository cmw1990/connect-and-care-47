
import { useState } from "react";
import { InsuranceForm } from "@/components/insurance/InsuranceForm";
import { InsuranceDashboard } from "@/components/insurance/InsuranceDashboard";
import { InsuranceAnalytics } from "@/components/insurance/InsuranceAnalytics";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

const Insurance = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Insurance Management</h1>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Add Insurance"}
        </Button>
      </div>

      {showForm ? (
        <InsuranceForm onSuccess={() => setShowForm(false)} />
      ) : (
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <InsuranceDashboard />
          </TabsContent>
          <TabsContent value="analytics">
            <InsuranceAnalytics />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Insurance;
