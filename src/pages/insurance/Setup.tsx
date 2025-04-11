
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Setup() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Insurance Setup</h1>
      <Card>
        <CardHeader>
          <CardTitle>Configure Your Insurance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Set up your insurance details and preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
