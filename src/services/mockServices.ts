
// Mock services for development without Supabase
export const HealthPredictionService = {
  getVitalSigns: async (userId: string) => [],
  addVitalSign: async (vitalSign: any) => ({ id: 'new-id', ...vitalSign }),
  getHealthLogs: async (userId: string) => [],
  addHealthLog: async (healthLog: any) => ({ id: 'new-id', ...healthLog }),
  getWellnessScore: async (userId: string) => ({ score: 85, date: new Date().toISOString() }),
  getWellnessTrends: async (userId: string) => [
    { date: '2023-01-01', score: 80 },
    { date: '2023-01-02', score: 82 },
    { date: '2023-01-03', score: 85 },
  ],
  getWellnessInsights: async (userId: string) => [
    'Sleep quality has improved this week',
    'Physical activity is below target',
    'Stress levels are trending downward',
  ],
  getWellnessGoals: async (userId: string) => [
    { id: '1', title: 'Improve sleep quality', progress: 70 },
    { id: '2', title: 'Increase physical activity', progress: 40 },
    { id: '3', title: 'Reduce stress levels', progress: 60 },
  ],
  subscribeToVitalSigns: (userId: string, callback: (payload: any) => void) => {
    // Mock subscription
    return { unsubscribe: () => {} };
  }
};
