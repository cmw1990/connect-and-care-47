
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Define interface for Disclaimer
interface Disclaimer {
  id: string;
  type: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

interface LegalDisclaimerProps {
  type: 'legal' | 'privacy' | 'all';
}

export const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({ type = 'all' }) => {
  // Instead of querying a database table, use mock data
  const mockDisclaimers: Disclaimer[] = [
    {
      id: '1',
      type: 'legal',
      title: 'Legal Disclaimer',
      content: 'This platform provides a way to connect with companions and caregivers, but we are not responsible for the quality of care provided. All caregivers are independent providers and not employees of our platform. We recommend conducting your own due diligence before engaging any caregiver or companion.',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'privacy',
      title: 'Privacy Notice',
      content: 'We take your privacy seriously. Information shared on this platform is used only for the purposes of connecting you with appropriate care resources. We do not sell your personal information to third parties. Please review our full privacy policy for more details.',
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      type: 'platform_disclaimer',
      title: 'Platform Limitations',
      content: 'This platform is intended to provide informational resources and connections to care providers. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with questions you may have regarding medical conditions.',
      created_at: new Date().toISOString(),
    }
  ];
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['disclaimers', type],
    queryFn: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      {(data || []).map((disclaimer) => (
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
