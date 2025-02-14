
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InsuranceForm } from "@/components/insurance/InsuranceForm";

export default function Setup() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Insurance Setup</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add Insurance Coverage</CardTitle>
          <CardDescription>
            Enter your insurance information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InsuranceForm />
        </CardContent>
      </Card>
    </div>
  );
}
