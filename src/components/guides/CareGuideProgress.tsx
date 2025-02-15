
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Check, Star, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface CareGuideProgressProps {
  completedSteps: number;
  totalSteps: number;
  streakDays: number;
  onComplete?: () => void;
}

export const CareGuideProgress: React.FC<CareGuideProgressProps> = ({
  completedSteps,
  totalSteps,
  streakDays,
  onComplete
}) => {
  const progress = (completedSteps / totalSteps) * 100;
  const isComplete = completedSteps === totalSteps;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="text-sm font-medium">Streak: {streakDays} days</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">{completedSteps}/{totalSteps}</span>
          {isComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-green-500"
            >
              <Check className="h-4 w-4" />
              <span className="text-xs">Complete!</span>
            </motion.div>
          )}
        </div>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between items-center">
        <div className="flex -space-x-2">
          {Array.from({ length: Math.min(3, completedSteps) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, x: -20 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-background"
            >
              <Star className="h-4 w-4 text-white" />
            </motion.div>
          ))}
        </div>
        {progress > 0 && progress < 100 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            Keep going! You're doing great!
          </motion.p>
        )}
      </div>
    </div>
  );
};
