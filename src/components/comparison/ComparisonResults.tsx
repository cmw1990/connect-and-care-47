import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";
import { ComparisonResult } from "./types";
import { ComparisonChart } from "./ComparisonChart";

interface ComparisonResultsProps {
  results: Record<string, ComparisonResult>;
}

export const ComparisonResults = ({ results }: ComparisonResultsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          Comparison Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ComparisonChart data={results} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Object.entries(results).map(([id, data]) => (
            <div key={id} className="p-4 border rounded">
              <h3 className="font-semibold">{data.name}</h3>
              <p className="text-sm text-gray-600 mt-2">
                Rating: {data.averageRating.toFixed(1)}
              </p>
              {data.features && data.features.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Key Features:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {data.features.slice(0, 3).map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.aiInsights && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium">AI Insights:</h4>
                  <p className="text-sm text-gray-600">{data.aiInsights}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};