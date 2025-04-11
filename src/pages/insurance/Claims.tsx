
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Claims() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Insurance Claims</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You don't have any recent insurance claims. Claims will appear here once processed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
