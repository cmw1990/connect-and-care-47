import { supabase } from '@/lib/supabase/client';
import { Tables } from '@/types/database.types';
import { analyticsService } from './analytics.service';
import { notificationService } from './notification.service';

export interface VitalSign {
  type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'blood_sugar' | 'oxygen_saturation' | 'weight' | 'height';
  value: number | string;
  unit: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface HealthMetric {
  type: 'sleep' | 'activity' | 'nutrition' | 'hydration' | 'mood' | 'pain' | 'symptoms';
  value: any;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  sideEffects?: string[];
  interactions?: string[];
  prescribedBy?: string;
  status: 'active' | 'completed' | 'discontinued';
}

class HealthService {
  async recordVitalSign(userId: string, vitalSign: VitalSign): Promise<void> {
    const { error } = await supabase
      .from('vital_signs')
      .insert({
        user_id: userId,
        type: vitalSign.type,
        value: vitalSign.value,
        unit: vitalSign.unit,
        timestamp: vitalSign.timestamp,
        metadata: vitalSign.metadata,
      });

    if (error) throw error;

    // Track health metric
    analyticsService.trackEvent({
      category: 'health',
      action: 'record_vital_sign',
      label: vitalSign.type,
      metadata: { userId, value: vitalSign.value },
    });

    // Check for concerning values and notify if needed
    await this.checkVitalSignAlerts(userId, vitalSign);
  }

  private async checkVitalSignAlerts(userId: string, vitalSign: VitalSign): Promise<void> {
    const thresholds: Record<string, { low: number; high: number }> = {
      blood_pressure: { low: 90, high: 140 }, // Systolic
      heart_rate: { low: 60, high: 100 },
      temperature: { low: 36.1, high: 37.8 },
      blood_sugar: { low: 70, high: 180 },
      oxygen_saturation: { low: 95, high: 100 },
    };

    const threshold = thresholds[vitalSign.type];
    if (!threshold) return;

    const value = Number(vitalSign.value);
    if (value < threshold.low || value > threshold.high) {
      await notificationService.create({
        userId,
        type: 'health_alert',
        title: 'Vital Sign Alert',
        message: `Your ${vitalSign.type} reading is outside normal range`,
        priority: 'high',
        data: { vitalSign },
      });
    }
  }

  async getVitalSigns(userId: string, params: {
    type?: VitalSign['type'];
    startDate?: string;
    endDate?: string;
  }): Promise<VitalSign[]> {
    let query = supabase
      .from('vital_signs')
      .select('*')
      .eq('user_id', userId);

    if (params.type) {
      query = query.eq('type', params.type);
    }

    if (params.startDate) {
      query = query.gte('timestamp', params.startDate);
    }

    if (params.endDate) {
      query = query.lte('timestamp', params.endDate);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  }

  async recordHealthMetric(userId: string, metric: HealthMetric): Promise<void> {
    const { error } = await supabase
      .from('health_metrics')
      .insert({
        user_id: userId,
        type: metric.type,
        value: metric.value,
        timestamp: metric.timestamp,
        metadata: metric.metadata,
      });

    if (error) throw error;

    analyticsService.trackEvent({
      category: 'health',
      action: 'record_health_metric',
      label: metric.type,
      metadata: { userId },
    });
  }

  async getHealthMetrics(userId: string, params: {
    type?: HealthMetric['type'];
    startDate?: string;
    endDate?: string;
  }): Promise<HealthMetric[]> {
    let query = supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId);

    if (params.type) {
      query = query.eq('type', params.type);
    }

    if (params.startDate) {
      query = query.gte('timestamp', params.startDate);
    }

    if (params.endDate) {
      query = query.lte('timestamp', params.endDate);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  }

  async addMedication(userId: string, medication: Omit<Medication, 'id'>): Promise<Medication> {
    const { data, error } = await supabase
      .from('medications')
      .insert({
        user_id: userId,
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        start_date: medication.startDate,
        end_date: medication.endDate,
        instructions: medication.instructions,
        side_effects: medication.sideEffects,
        interactions: medication.interactions,
        prescribed_by: medication.prescribedBy,
        status: medication.status,
      })
      .select()
      .single();

    if (error) throw error;

    // Schedule medication reminders
    await this.scheduleMedicationReminders(userId, data);

    return data;
  }

  private async scheduleMedicationReminders(userId: string, medication: Medication): Promise<void> {
    // Parse frequency and create reminder schedule
    const reminderTimes = this.parseFrequency(medication.frequency);
    
    for (const time of reminderTimes) {
      await notificationService.scheduleRecurring({
        userId,
        type: 'medication_reminder',
        title: 'Medication Reminder',
        message: `Time to take ${medication.name} - ${medication.dosage}`,
        schedule: time,
        data: { medicationId: medication.id },
      });
    }
  }

  private parseFrequency(frequency: string): string[] {
    // Convert frequency string to actual times
    // e.g., "twice daily" → ["09:00", "21:00"]
    const frequencyMap: Record<string, string[]> = {
      'once daily': ['09:00'],
      'twice daily': ['09:00', '21:00'],
      'three times daily': ['09:00', '15:00', '21:00'],
      'four times daily': ['09:00', '13:00', '17:00', '21:00'],
      'every morning': ['09:00'],
      'every evening': ['21:00'],
      'before bed': ['22:00'],
    };

    return frequencyMap[frequency.toLowerCase()] || ['09:00'];
  }

  async updateMedication(medicationId: string, updates: Partial<Medication>): Promise<Medication> {
    const { data, error } = await supabase
      .from('medications')
      .update({
        name: updates.name,
        dosage: updates.dosage,
        frequency: updates.frequency,
        start_date: updates.startDate,
        end_date: updates.endDate,
        instructions: updates.instructions,
        side_effects: updates.sideEffects,
        interactions: updates.interactions,
        prescribed_by: updates.prescribedBy,
        status: updates.status,
      })
      .eq('id', medicationId)
      .select()
      .single();

    if (error) throw error;

    // Update reminders if frequency changed
    if (updates.frequency) {
      await this.updateMedicationReminders(data);
    }

    return data;
  }

  private async updateMedicationReminders(medication: Medication): Promise<void> {
    // Cancel existing reminders
    await notificationService.cancelScheduled({
      type: 'medication_reminder',
      data: { medicationId: medication.id },
    });

    // Schedule new reminders
    if (medication.status === 'active') {
      await this.scheduleMedicationReminders(medication.id, medication);
    }
  }

  async getMedications(userId: string, status?: Medication['status']): Promise<Medication[]> {
    let query = supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  async recordMedicationAdherence(userId: string, medicationId: string, taken: boolean, timestamp: string): Promise<void> {
    const { error } = await supabase
      .from('medication_adherence')
      .insert({
        user_id: userId,
        medication_id: medicationId,
        taken,
        timestamp,
      });

    if (error) throw error;

    analyticsService.trackEvent({
      category: 'health',
      action: 'medication_adherence',
      label: taken ? 'taken' : 'missed',
      metadata: { userId, medicationId },
    });
  }

  async getAdherenceReport(userId: string, startDate: string, endDate: string): Promise<{
    total: number;
    taken: number;
    missed: number;
    adherenceRate: number;
  }> {
    const { data, error } = await supabase
      .from('medication_adherence')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);

    if (error) throw error;

    const total = data.length;
    const taken = data.filter(record => record.taken).length;
    const missed = total - taken;
    const adherenceRate = total > 0 ? (taken / total) * 100 : 0;

    return {
      total,
      taken,
      missed,
      adherenceRate,
    };
  }
}

export const healthService = new HealthService();
