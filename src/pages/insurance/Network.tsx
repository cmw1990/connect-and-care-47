
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Network() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Provider Network</h1>
      <Card>
        <CardHeader>
          <CardTitle>In-Network Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Search for in-network healthcare providers in your area.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
