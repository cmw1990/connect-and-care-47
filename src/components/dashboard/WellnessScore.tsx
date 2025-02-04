import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

interface WellnessScoreProps {
  groupId?: string;
}

export const WellnessScore = ({ groupId }: WellnessScoreProps) => {
  const { data: metrics } = useQuery({
    queryKey: ['wellnessMetrics', groupId],
    queryFn: async () => {
      if (!groupId) return null;
      
      const { data } = await supabase
        .from('care_quality_metrics')
        .select('*')
        .eq('group_id', groupId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();
        
      return data?.metric_value || null;
    },
    enabled: !!groupId
  });

  const calculateOverallScore = () => {
    if (!metrics) return 0;
    const scores = [
      metrics.physical || 0,
      metrics.mental || 0,
      metrics.mood || 0,
      metrics.activity || 0
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const score = calculateOverallScore();

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Heart className={`h-5 w-5 ${score > 70 ? 'text-green-500' : score > 40 ? 'text-yellow-500' : 'text-red-500'}`} />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Wellness Score</span>
                <span className="text-sm font-bold">{score}%</span>
              </div>
              <Progress value={score} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};