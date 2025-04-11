
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Disclaimer } from '@/types/comparison';

// Mock disclaimer data
const mockDisclaimers: Disclaimer[] = [
  {
    id: '1',
    type: 'legal',
    title: 'Terms of Service',
    content: `
# Terms of Service

Last Updated: January 1, 2023

Please read these Terms of Service ("Terms") carefully before using our platform.

## 1. Acceptance of Terms

By accessing or using our platform, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use the platform.

## 2. Description of Service

Our platform provides tools for caregivers and families to coordinate care for loved ones. The platform includes features for communication, scheduling, task management, and health tracking.

## 3. User Accounts

You must create an account to use certain features of the platform. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.

## 4. Medical Disclaimer

The platform is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
    `,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    type: 'privacy',
    title: 'Privacy Policy',
    content: `
# Privacy Policy

Last Updated: January 1, 2023

This Privacy Policy describes how we collect, use, and disclose your personal information when you use our platform.

## 1. Information We Collect

We collect information that you provide directly to us, information we collect automatically when you use the platform, and information we obtain from third-party sources.

## 2. How We Use Your Information

We use your information to provide, maintain, and improve the platform, to communicate with you, and to personalize your experience.

## 3. How We Share Your Information

We may share your information with third-party service providers, with your consent, or as required by law.

## 4. Your Choices

You can access, update, or delete your account information at any time. You can also opt out of certain communications.
    `,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
];

interface LegalDisclaimerProps {
  type?: 'legal' | 'privacy' | 'all';
  onAccept?: () => void;
}

export const LegalDisclaimer = ({ type = 'all', onAccept }: LegalDisclaimerProps) => {
  const [disclaimers, setDisclaimers] = useState<Disclaimer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDisclaimers();
  }, [type]);

  const fetchDisclaimers = async () => {
    try {
      // Filter mock data based on type
      const filteredDisclaimers = type === 'all'
        ? mockDisclaimers
        : mockDisclaimers.filter(d => d.type === type);
      
      setDisclaimers(filteredDisclaimers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching disclaimers:', error);
      toast({
        title: "Error",
        description: "Failed to load legal documents",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleAccept = () => {
    // In a real app, this would save user consent
    toast({
      title: "Accepted",
      description: "You have accepted the terms and conditions.",
    });
    
    if (onAccept) {
      onAccept();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Info className="h-5 w-5 mr-2" />
          Legal Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        {disclaimers.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No legal documents found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {disclaimers.map((disclaimer) => (
              <div key={disclaimer.id} className="space-y-2">
                <h2 className="text-lg font-semibold">{disclaimer.title}</h2>
                <ScrollArea className="h-60 border rounded-md p-4">
                  <div className="prose prose-sm">
                    {disclaimer.content.split('\n').map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ))}
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleAccept}>
                I Accept
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LegalDisclaimer;
