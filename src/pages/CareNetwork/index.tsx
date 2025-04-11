
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CareNetwork() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Care Network</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Care Network</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You don't have any connections in your care network yet. Add family members, caregivers, or healthcare professionals to build your network.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
