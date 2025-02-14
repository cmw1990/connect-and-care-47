
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { InsuranceForm } from "@/components/insurance/InsuranceForm";

export default function Setup() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSetupComplete = () => {
    toast({
      title: "Success",
      description: "Your insurance information has been saved.",
    });
    navigate("/insurance");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        Insurance Setup
      </h1>
      <InsuranceForm onSuccess={handleSetupComplete} />
    </div>
  );
}
