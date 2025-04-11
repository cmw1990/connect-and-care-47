
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Documents() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Insurance Documents</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You don't have any insurance documents uploaded yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
