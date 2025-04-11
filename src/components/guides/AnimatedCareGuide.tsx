
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronRight, BookOpen, Award, Target } from 'lucide-react';
import { DetailedCareGuideProgress } from './CareGuideProgress';
import { useToast } from '@/hooks/use-toast';

interface Step {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export const AnimatedCareGuide = () => {
  const [steps, setSteps] = useState<Step[]>([
    { 
      id: 1, 
      title: 'Set up your care profile', 
      description: 'Add your personal information, preferences, and medical details to help us customize your care plan.',
      completed: true 
    },
    { 
      id: 2, 
      title: 'Connect with your care team', 
      description: 'Invite family members, caregivers, and healthcare professionals to join your care circle.',
      completed: true 
    },
    { 
      id: 3, 
      title: 'Set up medication reminders', 
      description: 'Add your medications and set up automated reminders for you and your care team.',
      completed: false 
    },
    { 
      id: 4, 
      title: 'Create your first care routine', 
      description: 'Establish daily routines and activities to maintain health and wellbeing.',
      completed: false 
    },
    { 
      id: 5, 
      title: 'Schedule your first check-in', 
      description: 'Set up regular check-ins to monitor your health and receive assistance when needed.',
      completed: false 
    }
  ]);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [streakDays, setStreakDays] = useState(3);
  const { toast } = useToast();
  
  useEffect(() => {
    // Automatically proceed to the first incomplete step
    const firstIncompleteIndex = steps.findIndex(step => !step.completed);
    if (firstIncompleteIndex !== -1) {
      setCurrentStep(firstIncompleteIndex);
    }
  }, []);
  
  const handleCompleteStep = async (index: number) => {
    if (steps[index].completed) return;
    
    setIsAnimating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSteps = [...steps];
      newSteps[index].completed = true;
      setSteps(newSteps);
      
      // Automatically advance to the next incomplete step
      const nextIncompleteIndex = newSteps.findIndex((step, i) => i > index && !step.completed);
      if (nextIncompleteIndex !== -1) {
        setCurrentStep(nextIncompleteIndex);
      }
      
      setStreakDays(streakDays + 1);
      
      toast({
        title: "Step Completed!",
        description: `You've completed "${steps[index].title}". Keep up the good work!`,
      });
    } catch (error) {
      console.error('Error completing step:', error);
      toast({
        title: "Error",
        description: "Failed to complete step. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnimating(false);
    }
  };
  
  const completedCount = steps.filter(step => step.completed).length;
  const completionPercentage = (completedCount / steps.length) * 100;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Care Guide
          </CardTitle>
          <CardDescription>Complete these steps to set up your care plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <DetailedCareGuideProgress
              completedSteps={completedCount}
              totalSteps={steps.length}
              streakDays={streakDays}
            />
          </div>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <Card 
                key={step.id} 
                className={`transition-all duration-300 ${
                  currentStep === index 
                    ? 'border-primary shadow-md' 
                    : step.completed 
                      ? 'border-green-200 bg-green-50/50 dark:bg-green-950/10 dark:border-green-900/50' 
                      : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center h-8 w-8 rounded-full mr-3 ${
                        step.completed 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' 
                          : 'bg-muted'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{step.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">{step.description}</div>
                      </div>
                    </div>
                    {!step.completed && currentStep === index && (
                      <Button 
                        onClick={() => handleCompleteStep(index)}
                        disabled={isAnimating}
                        size="sm"
                      >
                        {isAnimating ? (
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        ) : (
                          <>
                            Complete
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {completionPercentage >= 60 && (
        <Card className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-200 dark:border-violet-900/50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-violet-100 dark:bg-violet-900/50 p-3 rounded-full">
                <Award className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Almost there!</h3>
                <p className="text-muted-foreground mb-4">
                  You've completed {completedCount} out of {steps.length} steps. 
                  Keep going to unlock additional care features.
                </p>
                <Button variant="outline" className="bg-white dark:bg-black">
                  <Target className="mr-2 h-4 w-4" />
                  View achievements
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
