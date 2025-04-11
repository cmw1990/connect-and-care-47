
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <section className="py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Welcome to Care Compass</h1>
          <p className="text-xl text-muted-foreground mt-2">Your comprehensive care management platform</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Care Network</CardTitle>
              <CardDescription>Manage your care connections</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <p className="text-center">Connect with caregivers, family members, and healthcare professionals.</p>
              <Button onClick={() => navigate('/care-network')} className="w-full">
                View Network <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Care Management</CardTitle>
              <CardDescription>Organize care activities</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <p className="text-center">Schedule and track care tasks, medications, and appointments.</p>
              <Button onClick={() => navigate('/care-management')} className="w-full">
                Manage Care <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Insurance</CardTitle>
              <CardDescription>Track your coverage</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <p className="text-center">View insurance benefits, submit claims, and manage documents.</p>
              <Button onClick={() => navigate('/insurance/coverage')} className="w-full">
                View Insurance <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
