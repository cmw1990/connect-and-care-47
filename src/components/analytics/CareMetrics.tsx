
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { typeCastObject } from '@/utils/mockDataHelper';

interface CareMetricsProps {
  groupId: string;
}

export const CareMetrics: React.FC<CareMetricsProps> = ({ groupId }) => {
  const [metricsData, setMetricsData] = useState<any[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Mock data instead of database queries
        const mockMetricsData = [
          { date: 'Jan', careHours: 120, socialInteractions: 15, medicationAdherence: 95 },
          { date: 'Feb', careHours: 135, socialInteractions: 18, medicationAdherence: 97 },
          { date: 'Mar', careHours: 128, socialInteractions: 20, medicationAdherence: 94 },
          { date: 'Apr', careHours: 142, socialInteractions: 22, medicationAdherence: 98 },
          { date: 'May', careHours: 150, socialInteractions: 25, medicationAdherence: 99 },
          { date: 'Jun', careHours: 145, socialInteractions: 23, medicationAdherence: 96 },
        ];
        
        const mockQualityMetrics = [
          { date: 'Jan', patientSatisfaction: 85, caregiverRating: 4.2 },
          { date: 'Feb', patientSatisfaction: 87, caregiverRating: 4.3 },
          { date: 'Mar', patientSatisfaction: 86, caregiverRating: 4.1 },
          { date: 'Apr', patientSatisfaction: 89, caregiverRating: 4.4 },
          { date: 'May', patientSatisfaction: 92, caregiverRating: 4.7 },
          { date: 'Jun', patientSatisfaction: 91, caregiverRating: 4.5 },
        ];

        setMetricsData(mockMetricsData);
        setQualityMetrics(mockQualityMetrics);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [groupId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Care Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Care Metrics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metricsData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="careHours" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="socialInteractions" stroke="#82ca9d" />
                <Line type="monotone" dataKey="medicationAdherence" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={qualityMetrics}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="patientSatisfaction" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Caregiver Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={qualityMetrics}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="caregiverRating" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
