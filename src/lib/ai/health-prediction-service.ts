import { supabase } from '@/lib/supabase/client';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { HealthData } from '@/lib/device-integration/wearable-service';

export interface HealthPrediction {
  id: string;
  userId: string;
  deviceId: string;
  type: 'sleep_quality' | 'stress_level' | 'activity_recommendation' | 'health_risk';
  prediction: string;
  confidence: number;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface HealthTrend {
  type: string;
  trend: 'improving' | 'declining' | 'stable';
  startDate: Date;
  endDate: Date;
  data: number[];
}

class HealthPredictionService {
  private subscriptions: Map<string, () => void> = new Map();
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Set up real-time subscriptions for predictions
      const predictionSubscription = supabase
        .channel('health_predictions')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'health_predictions' },
          this.handlePredictionUpdate
        )
        .subscribe();

      this.subscriptions.set('predictions', () => predictionSubscription.unsubscribe());
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing health prediction service:', error);
      throw error;
    }
  }

  private handlePredictionUpdate = async (payload: any) => {
    const prediction = payload.new as HealthPrediction;

    try {
      // Trigger haptic feedback based on prediction confidence
      if (prediction.confidence > 0.8) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if (prediction.confidence > 0.5) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }

      // Show notification for important predictions
      if (this.isImportantPrediction(prediction)) {
        await this.notifyPrediction(prediction);
      }
    } catch (error) {
      console.error('Error handling prediction update:', error);
    }
  };

  private isImportantPrediction(prediction: HealthPrediction): boolean {
    return (
      prediction.type === 'health_risk' ||
      (prediction.confidence > 0.8 && prediction.type === 'stress_level') ||
      (prediction.confidence > 0.9 && prediction.type === 'sleep_quality')
    );
  }

  private async notifyPrediction(prediction: HealthPrediction) {
    await LocalNotifications.schedule({
      notifications: [{
        title: 'Health Insight',
        body: this.formatPredictionMessage(prediction),
        id: Date.now(),
        schedule: { at: new Date() },
        sound: prediction.type === 'health_risk' ? 'alert.wav' : 'notification.wav',
        attachments: null,
        actionTypeId: 'health_prediction',
        extra: {
          predictionId: prediction.id,
          type: prediction.type,
          confidence: prediction.confidence,
        },
      }],
    });
  }

  private formatPredictionMessage(prediction: HealthPrediction): string {
    const confidencePercent = Math.round(prediction.confidence * 100);
    
    switch (prediction.type) {
      case 'health_risk':
        return `⚠️ Health Risk Alert: ${prediction.prediction} (${confidencePercent}% confidence)`;
      case 'stress_level':
        return `😌 Stress Level Update: ${prediction.prediction}`;
      case 'sleep_quality':
        return `😴 Sleep Quality Insight: ${prediction.prediction}`;
      case 'activity_recommendation':
        return `🏃‍♂️ Activity Suggestion: ${prediction.prediction}`;
      default:
        return `New Health Insight: ${prediction.prediction}`;
    }
  }

  async generatePredictions(
    userId: string,
    healthData: HealthData[],
    types: HealthPrediction['type'][]
  ): Promise<HealthPrediction[]> {
    try {
      await this.initialize();

      // Process health data and generate predictions
      const predictions = await Promise.all(
        types.map(async (type) => {
          const prediction = await this.analyzeTrendAndPredict(type, healthData);
          
          // Store prediction in database
          const { data, error } = await supabase
            .from('health_predictions')
            .insert({
              userId,
              deviceId: healthData[0]?.deviceId,
              type,
              prediction: prediction.prediction,
              confidence: prediction.confidence,
              timestamp: new Date(),
              metadata: prediction.metadata,
            })
            .select()
            .single();

          if (error) throw error;
          return data;
        })
      );

      return predictions;
    } catch (error) {
      console.error('Error generating predictions:', error);
      throw error;
    }
  }

  private async analyzeTrendAndPredict(
    type: HealthPrediction['type'],
    healthData: HealthData[]
  ): Promise<{
    prediction: string;
    confidence: number;
    metadata: Record<string, any>;
  }> {
    // Implement prediction logic based on type and health data
    // This is a simplified example - real implementation would use more sophisticated ML models
    const trend = this.calculateTrend(healthData);
    const recentData = healthData.slice(0, 10);
    const average = this.calculateAverage(recentData);

    switch (type) {
      case 'sleep_quality':
        return this.predictSleepQuality(trend, average);
      case 'stress_level':
        return this.predictStressLevel(trend, average);
      case 'activity_recommendation':
        return this.generateActivityRecommendation(trend, average);
      case 'health_risk':
        return this.assessHealthRisk(trend, average);
      default:
        throw new Error(`Unsupported prediction type: ${type}`);
    }
  }

  private calculateTrend(data: HealthData[]): HealthTrend['trend'] {
    if (data.length < 2) return 'stable';

    const values = data.map(d => d.value);
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = this.calculateAverage(firstHalf);
    const secondAvg = this.calculateAverage(secondHalf);

    if (secondAvg > firstAvg * 1.1) return 'improving';
    if (secondAvg < firstAvg * 0.9) return 'declining';
    return 'stable';
  }

  private calculateAverage(data: any[]): number {
    if (!data.length) return 0;
    return data.reduce((sum, d) => sum + (typeof d === 'number' ? d : d.value), 0) / data.length;
  }

  private predictSleepQuality(trend: HealthTrend['trend'], average: number) {
    // Implement sleep quality prediction logic
    return {
      prediction: `Your sleep quality is ${trend}. Average duration: ${Math.round(average)} hours.`,
      confidence: 0.85,
      metadata: { trend, average },
    };
  }

  private predictStressLevel(trend: HealthTrend['trend'], average: number) {
    // Implement stress level prediction logic
    return {
      prediction: `Your stress level appears to be ${trend}. Consider relaxation techniques.`,
      confidence: 0.75,
      metadata: { trend, average },
    };
  }

  private generateActivityRecommendation(trend: HealthTrend['trend'], average: number) {
    // Implement activity recommendation logic
    return {
      prediction: `Based on your ${trend} activity level, we recommend increasing daily steps.`,
      confidence: 0.8,
      metadata: { trend, average },
    };
  }

  private assessHealthRisk(trend: HealthTrend['trend'], average: number) {
    // Implement health risk assessment logic
    const risk = trend === 'declining' ? 'moderate' : 'low';
    return {
      prediction: `Health risk level: ${risk}. ${trend === 'declining' ? 'Consider consulting your healthcare provider.' : 'Keep up the good work!'}`,
      confidence: 0.9,
      metadata: { risk, trend, average },
    };
  }

  async getPredictionHistory(
    userId: string,
    type?: HealthPrediction['type'],
    startTime?: Date,
    endTime?: Date
  ): Promise<HealthPrediction[]> {
    try {
      let query = supabase
        .from('health_predictions')
        .select('*')
        .eq('userId', userId)
        .order('timestamp', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      if (startTime) {
        query = query.gte('timestamp', startTime.toISOString());
      }

      if (endTime) {
        query = query.lte('timestamp', endTime.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting prediction history:', error);
      throw error;
    }
  }

  cleanup() {
    // Clean up all subscriptions
    for (const unsubscribe of this.subscriptions.values()) {
      unsubscribe();
    }
    this.subscriptions.clear();
    this.isInitialized = false;
  }
}

export const healthPredictionService = new HealthPredictionService();
