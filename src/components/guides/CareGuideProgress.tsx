
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ChevronRight, BookOpen } from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface CareGuideProgressProps {
  title: string;
  description?: string;
  progress: number;
  sections: GuideSection[];
  onContinue: () => void;
  onViewSection: (sectionId: string) => void;
}

export const CareGuideProgress: React.FC<CareGuideProgressProps> = ({
  title,
  description,
  progress,
  sections,
  onContinue,
  onViewSection,
}) => {
  const completedSections = sections.filter(section => section.completed).length;
  const totalSections = sections.length;
  const percentComplete = Math.round((completedSections / totalSections) * 100);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{percentComplete}% Complete</span>
            </div>
            <Progress
              value={percentComplete}
              // Use className to style the progress bar wrapper
              className="h-2"
              // Instead of indicatorClassName, apply styling directly to the progress bar's indicator
              style={{ "--radius": "0.5rem" } as React.CSSProperties}
            />
          </div>
          
          <div className="space-y-2">
            {sections.map((section) => (
              <div
                key={section.id}
                className={`p-3 rounded-lg flex items-center justify-between cursor-pointer
                  ${section.completed 
                    ? 'bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900' 
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => onViewSection(section.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 mt-0.5 ${section.completed ? 'text-primary' : 'text-muted-foreground'}`}>
                    {section.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <div className="h-5 w-5 border-2 rounded-full border-current" />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-medium text-sm ${section.completed ? 'text-primary-700 dark:text-primary-300' : ''}`}>
                      {section.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {section.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button onClick={onContinue} className="w-full">
          {completedSections === totalSections ? 'View Complete Guide' : 'Continue Learning'}
        </Button>
      </CardFooter>
    </Card>
  );
};
