
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CareManagement() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Care Management</h1>
      
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="plans">Care Plans</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Care Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No tasks are currently assigned. Create a new task to get started.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle>Care Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No care plans have been created yet. Create a new care plan to get started.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Medical Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No documents have been uploaded yet. Upload a document to get started.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
