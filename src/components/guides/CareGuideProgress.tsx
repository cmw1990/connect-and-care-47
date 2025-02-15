
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Check, Star, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";

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
    <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-yellow-100 p-2 rounded-full">
            <Trophy className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="space-y-1">
            <span className="text-sm font-medium">Current Streak</span>
            <div className="text-2xl font-bold text-yellow-500">{streakDays} days</div>
          </div>
        </motion.div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">{completedSteps}/{totalSteps}</span>
          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2 text-green-500 bg-green-50 px-3 py-1 rounded-full"
              >
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Complete!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="space-y-2">
        <Progress 
          value={progress} 
          className="h-2.5 bg-gray-100"
          indicatorClassName="bg-gradient-to-r from-yellow-400 to-yellow-500"
        />
        <div className="flex justify-between items-center">
          <div className="flex -space-x-2">
            {Array.from({ length: Math.min(3, completedSteps) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: -20 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center ring-2 ring-background shadow-lg"
              >
                <Star className="h-4 w-4 text-white" />
              </motion.div>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {progress > 0 && progress < 100 && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full"
              >
                Keep going! You're doing great! 🎉
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
};
