
import { useState } from "react";
import { InsuranceForm } from "@/components/insurance/InsuranceForm";
import { InsuranceList } from "@/components/insurance/InsuranceList";
import { Button } from "@/components/ui/button";
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
        <InsuranceList />
      )}
    </div>
  );
};

export default Insurance;
