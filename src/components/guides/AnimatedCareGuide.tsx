
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Play, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CareGuideProgress } from "./CareGuideProgress";
import { Button } from "@/components/ui/button";

interface AnimatedGuideProps {
  disease: string;
  description: string;
  guidelines: string[];
}

export const AnimatedCareGuide = ({ disease, description, guidelines }: AnimatedGuideProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [streakDays, setStreakDays] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const generateImage = async () => {
      try {
        // Set a default fallback image first
        const fallbackImage = `https://placehold.co/600x400/e2e8f0/64748b?text=${encodeURIComponent(disease)}+Care+Guide`;
        
        const { data, error } = await supabase.functions.invoke('generate-care-image', {
          body: { disease, description }
        });

        if (error) {
          console.error('Supabase function error:', error);
          // Parse the error response
          try {
            const errorBody = JSON.parse(error.body || '{}');
            if (errorBody.fallbackImage) {
              setImageUrl(errorBody.fallbackImage);
              if (errorBody.details) {
                toast({
                  title: "Using placeholder image",
                  description: errorBody.details,
                  variant: "default",
                });
              }
              return;
            }
          } catch (parseError) {
            console.error('Error parsing error body:', parseError);
          }
          
          // If we couldn't get a fallback from the error, use our default
          setImageUrl(fallbackImage);
          toast({
            title: "Using placeholder image",
            description: "Image generation is temporarily unavailable",
            variant: "default",
          });
          return;
        }

        // Handle successful response
        if (data?.imageUrl) {
          setImageUrl(data.imageUrl);
        } else if (data?.fallbackImage) {
          setImageUrl(data.fallbackImage);
          toast({
            title: "Using placeholder image",
            description: data.details || "Image generation is temporarily unavailable",
            variant: "default",
          });
        } else {
          setImageUrl(fallbackImage);
        }
      } catch (err) {
        console.error('Error generating image:', err);
        setError('Failed to generate care guide image');
        setImageUrl(`https://placehold.co/600x400/e2e8f0/64748b?text=${encodeURIComponent(disease)}+Care+Guide`);
      }
    };

    generateImage();
  }, [disease, description, toast]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev === guidelines.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, guidelines.length]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && currentStep === guidelines.length - 1) {
      setCurrentStep(0);
    }
  };

  const handleStepComplete = async () => {
    if (!completedSteps.includes(currentStep)) {
      const newCompletedSteps = [...completedSteps, currentStep];
      setCompletedSteps(newCompletedSteps);
      
      // Update streak
      const lastUpdateDate = localStorage.getItem('lastGuideUpdate');
      const today = new Date().toISOString().split('T')[0];
      
      if (lastUpdateDate !== today) {
        const currentStreak = Number(localStorage.getItem('streakDays') || '0');
        const newStreak = currentStreak + 1;
        setStreakDays(newStreak);
        localStorage.setItem('streakDays', newStreak.toString());
        localStorage.setItem('lastGuideUpdate', today);
      }

      // Show encouraging toast
      if (newCompletedSteps.length === guidelines.length) {
        toast({
          title: "Congratulations! 🎉",
          description: "You've completed all the care guide steps!",
          variant: "default",
        });
      } else {
        toast({
          title: "Great progress! 👏",
          description: "Keep going with the care guide steps!",
          variant: "default",
        });
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          {disease} Care Guide
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          {imageUrl ? (
            <motion.img
              src={imageUrl}
              alt={`Care guide for ${disease}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Play className="h-12 w-12 text-muted-foreground animate-pulse" />
            </div>
          )}
        </div>

        <CareGuideProgress
          completedSteps={completedSteps.length}
          totalSteps={guidelines.length}
          streakDays={streakDays}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <motion.button
              onClick={handlePlayPause}
              className={`px-4 py-2 rounded-full ${
                isPlaying ? 'bg-secondary' : 'bg-primary'
              } text-white flex items-center gap-2`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="h-4 w-4" />
              {isPlaying ? 'Pause' : 'Play'}
            </motion.button>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {guidelines.length}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-muted p-4 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 
                  className={`h-5 w-5 ${
                    completedSteps.includes(currentStep) 
                      ? 'text-green-500' 
                      : 'text-primary'
                  }`} 
                />
                <div className="flex-1 space-y-2">
                  <p className="text-sm">{guidelines[currentStep]}</p>
                  {!completedSteps.includes(currentStep) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStepComplete}
                      className="w-full sm:w-auto mt-2"
                    >
                      Mark as Complete
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};
