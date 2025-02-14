
import { InsuranceProviderSearch } from "@/components/insurance/InsuranceProviderSearch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Network() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Provider Network</h1>
      <Card>
        <CardHeader>
          <CardTitle>Find In-Network Providers</CardTitle>
          <CardDescription>
            Search for healthcare providers in your insurance network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InsuranceProviderSearch />
        </CardContent>
      </Card>
    </div>
  );
}
