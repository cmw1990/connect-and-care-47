
import { InsuranceClaimsList } from "@/components/insurance/InsuranceClaimsList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function Claims() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Insurance Claims</h1>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Claim
        </Button>
      </div>
      <InsuranceClaimsList />
    </div>
  );
}
