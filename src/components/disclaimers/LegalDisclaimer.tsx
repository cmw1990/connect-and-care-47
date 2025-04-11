
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Disclaimer } from '@/types';
import { createMockDisclaimers } from '@/utils/mockDataHelper';

interface LegalDisclaimerProps {
  type?: 'legal' | 'privacy' | 'all';
}

export const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({ type = 'all' }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['disclaimers', type],
    queryFn: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockDisclaimers = createMockDisclaimers();
      
      if (type === 'all') {
        return mockDisclaimers;
      }
      
      return mockDisclaimers.filter(disclaimer => disclaimer.type === type);
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load disclaimer information. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {(data || []).map((disclaimer: Disclaimer) => (
        <Alert key={disclaimer.id} className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{disclaimer.title}</AlertTitle>
          <AlertDescription className="text-sm">
            {disclaimer.content}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};
