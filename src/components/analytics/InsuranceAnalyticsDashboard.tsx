
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useToast } from "@/hooks/use-toast";

interface InsuranceMetric {
  id: string;
  type: string;
  value: number;
  period?: string; // Optional period for time-series data
}

interface InsuranceAnalyticsDashboardProps {
  userId: string;
}

export function InsuranceAnalyticsDashboard({ userId }: InsuranceAnalyticsDashboardProps) {
  const [claimsData, setClaimsData] = useState<InsuranceMetric[]>([]);
  const [coverageData, setCoverageData] = useState<InsuranceMetric[]>([]);
  const [spendingData, setSpendingData] = useState<InsuranceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF'];
  
  useEffect(() => {
    const fetchInsuranceAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // Mock claim data
        const mockClaimsData: InsuranceMetric[] = [
          { id: '1', type: 'Approved', value: 65 },
          { id: '2', type: 'Pending', value: 20 },
          { id: '3', type: 'Denied', value: 15 }
        ];
        
        // Mock coverage data
        const mockCoverageData: InsuranceMetric[] = [
          { id: '1', type: 'Medical', value: 70 },
          { id: '2', type: 'Prescriptions', value: 85 },
          { id: '3', type: 'Specialist', value: 65 },
          { id: '4', type: 'Home Care', value: 45 },
          { id: '5', type: 'Therapy', value: 60 }
        ];
        
        // Mock spending over time
        const mockSpendingData: InsuranceMetric[] = [
          { id: '1', type: 'spending', value: 350, period: 'Jan' },
          { id: '2', type: 'spending', value: 420, period: 'Feb' },
          { id: '3', type: 'spending', value: 380, period: 'Mar' },
          { id: '4', type: 'spending', value: 490, period: 'Apr' },
          { id: '5', type: 'spending', value: 520, period: 'May' },
          { id: '6', type: 'spending', value: 450, period: 'Jun' }
        ];
        
        setClaimsData(mockClaimsData);
        setCoverageData(mockCoverageData);
        setSpendingData(mockSpendingData);
      } catch (error) {
        console.error('Error fetching insurance analytics:', error);
        toast({
          title: "Error",
          description: "Failed to load insurance analytics",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInsuranceAnalytics();
  }, [userId, toast]);
  
  const formatSpendingData = () => {
    return spendingData.map(item => ({
      period: item.period,
      value: item.value
    }));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insurance Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
            <TabsTrigger value="coverage">Coverage</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-6">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-80 bg-muted rounded-md"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 bg-muted rounded-md"></div>
                  <div className="h-32 bg-muted rounded-md"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="h-80">
                  <h3 className="text-lg font-medium mb-2">Spending Trends</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatSpendingData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Spending']} />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Claims Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={claimsData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              label={({type, value}) => `${type}: ${value}%`}
                            >
                              {claimsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Coverage Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {coverageData.map(item => (
                          <div key={item.id} className="flex items-center justify-between">
                            <span className="text-sm">{item.type}</span>
                            <div className="flex items-center">
                              <div className="w-32 bg-muted rounded-full h-2.5 mr-2">
                                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${item.value}%` }}></div>
                              </div>
                              <span className="text-sm">{item.value}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="claims" className="pt-6">
            <p className="text-muted-foreground">Detailed claims analysis coming soon.</p>
          </TabsContent>
          <TabsContent value="coverage" className="pt-6">
            <p className="text-muted-foreground">Detailed coverage analysis coming soon.</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
