
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Disclaimer } from '@/types';
import { FileText, Download, Check, Shield } from 'lucide-react';
import { createMockDisclaimers } from '@/utils/mockDataHelper';

interface LegalDisclaimerProps {
  type?: 'medical' | 'privacy' | 'terms' | 'legal' | 'all';
}

export function LegalDisclaimer({ type = 'all' }: LegalDisclaimerProps) {
  const [disclaimers, setDisclaimers] = useState<Disclaimer[]>([]);
  const [acceptedDisclaimers, setAcceptedDisclaimers] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch disclaimers based on type
    fetchDisclaimers();
  }, [type]);

  const fetchDisclaimers = async () => {
    // Simulate API call delay
    setTimeout(() => {
      // Create mock disclaimers
      const allDisclaimers = createMockDisclaimers(4);
      
      let filteredDisclaimers = allDisclaimers;
      if (type !== 'all') {
        filteredDisclaimers = allDisclaimers.filter(d => d.type === type);
      }
      
      setDisclaimers(filteredDisclaimers);
      
      // Initialize acceptance state
      const initialAcceptance: Record<string, boolean> = {};
      filteredDisclaimers.forEach(d => {
        initialAcceptance[d.id] = false;
      });
      
      setAcceptedDisclaimers(initialAcceptance);
      setLoading(false);
    }, 500);
  };

  const handleAccept = (id: string) => {
    setAcceptedDisclaimers(prev => ({
      ...prev,
      [id]: true
    }));
  };

  const allAccepted = Object.values(acceptedDisclaimers).every(v => v);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Legal Disclaimers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (disclaimers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Legal Disclaimers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No disclaimers required for this section.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Legal Disclaimers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {type === 'all' ? (
          <Tabs defaultValue={disclaimers[0].type}>
            <TabsList className="mb-4">
              {disclaimers.map(disclaimer => (
                <TabsTrigger key={disclaimer.id} value={disclaimer.type}>
                  {disclaimer.type.charAt(0).toUpperCase() + disclaimer.type.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {disclaimers.map(disclaimer => (
              <TabsContent key={disclaimer.id} value={disclaimer.type}>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg max-h-52 overflow-y-auto">
                    <h3 className="font-medium mb-2">{disclaimer.title}</h3>
                    <p className="text-sm text-muted-foreground">{disclaimer.content}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                    
                    <Button 
                      variant={acceptedDisclaimers[disclaimer.id] ? "outline" : "default"} 
                      size="sm"
                      onClick={() => handleAccept(disclaimer.id)}
                      disabled={acceptedDisclaimers[disclaimer.id]}
                      className="flex items-center gap-1"
                    >
                      {acceptedDisclaimers[disclaimer.id] ? (
                        <>
                          <Check className="h-4 w-4" />
                          Accepted
                        </>
                      ) : (
                        'Accept'
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          disclaimers.map(disclaimer => (
            <div key={disclaimer.id} className="space-y-4">
              <div className="p-4 bg-muted rounded-lg max-h-52 overflow-y-auto">
                <h3 className="font-medium mb-2">{disclaimer.title}</h3>
                <p className="text-sm text-muted-foreground">{disclaimer.content}</p>
              </div>
              
              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                
                <Button 
                  variant={acceptedDisclaimers[disclaimer.id] ? "outline" : "default"} 
                  size="sm"
                  onClick={() => handleAccept(disclaimer.id)}
                  disabled={acceptedDisclaimers[disclaimer.id]}
                  className="flex items-center gap-1"
                >
                  {acceptedDisclaimers[disclaimer.id] ? (
                    <>
                      <Check className="h-4 w-4" />
                      Accepted
                    </>
                  ) : (
                    'Accept'
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
        
        {allAccepted && (
          <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg flex items-center">
            <Check className="h-5 w-5 mr-2" />
            <p className="text-sm">All required disclaimers have been accepted.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
