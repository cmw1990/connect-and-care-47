
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

interface WellnessScoreProps {
  groupId?: string;
}

interface MetricValue {
  physical: number;
  mental: number;
  mood: number;
  activity: number;
}

export const WellnessScore = ({ groupId }: WellnessScoreProps) => {
  const { data: metrics } = useQuery({
    queryKey: ['wellnessMetrics', groupId],
    queryFn: async () => {
      if (!groupId) return null;
      
      const { data, error } = await supabase
        .from('care_quality_metrics')
        .select('*')
        .eq('group_id', groupId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching metrics:', error);
        return null;
      }

      const metricValue = data?.metric_value as unknown;
      if (isValidMetricValue(metricValue)) {
        return metricValue;
      }
      return null;
    },
    enabled: !!groupId
  });

  const isValidMetricValue = (value: unknown): value is MetricValue => {
    if (typeof value !== 'object' || value === null) return false;
    const v = value as any;
    return (
      typeof v.physical === 'number' &&
      typeof v.mental === 'number' &&
      typeof v.mood === 'number' &&
      typeof v.activity === 'number'
    );
  };

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
  const getScoreColor = (score: number) => {
    if (score > 70) return 'text-secondary-500';
    if (score > 40) return 'text-primary-500';
    return 'text-accent-500';
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-opacity-20 ${getScoreColor(score)} bg-current`}>
              <Heart className={`h-5 w-5 ${getScoreColor(score)}`} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-600">Wellness Score</span>
                <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}%</span>
              </div>
              <Progress 
                value={score} 
                className={`h-2 ${getScoreColor(score)}`}
              />
              {metrics && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-secondary-200"></div>
                    Physical: {metrics.physical}%
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary-200"></div>
                    Mental: {metrics.mental}%
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-secondary-300"></div>
                    Mood: {metrics.mood}%
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary-300"></div>
                    Activity: {metrics.activity}%
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
