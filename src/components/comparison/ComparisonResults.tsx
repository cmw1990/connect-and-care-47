import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Brain } from "lucide-react";
import { ComparisonResult } from "./types";
import { ComparisonChart } from "./ComparisonChart";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ComparisonResultsProps {
  results: Record<string, ComparisonResult>;
}

export const ComparisonResults = ({ results }: ComparisonResultsProps) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getAIAnalysis = async () => {
      try {
        setIsAnalyzing(true);
        const items = Object.entries(results).map(([id, data]) => ({
          id,
          name: data.name,
          description: data.description || data.features?.join('. '),
        }));

        const { data: analysisData, error } = await supabase.functions.invoke('compare-analysis', {
          body: {
            items,
            type: 'facilities',
            userType: 'family_caregiver', // This could be dynamic based on user role
          },
        });

        if (error) throw error;

        setAiAnalysis(analysisData.analysis);
      } catch (error) {
        console.error('Error getting AI analysis:', error);
        toast({
          title: "Error",
          description: "Failed to get AI analysis. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    if (Object.keys(results).length > 0) {
      getAIAnalysis();
    }
  }, [results]);

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
        
        {isAnalyzing ? (
          <div className="flex items-center justify-center p-8">
            <Brain className="h-6 w-6 animate-pulse text-primary" />
            <span className="ml-2">Analyzing comparison data...</span>
          </div>
        ) : aiAnalysis && (
          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <h3 className="font-semibold mb-2">AI Analysis</h3>
            <p className="text-sm text-gray-600 whitespace-pre-line">{aiAnalysis}</p>
          </div>
        )}

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