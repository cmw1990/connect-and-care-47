import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface VitalSign {
  id: string;
  userId: string;
  type: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
  startDate: Date;
  endDate?: Date;
  instructions?: string;
  refillReminder: boolean;
  refillDate?: Date;
  status: 'active' | 'completed' | 'discontinued';
  adherence: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  userId: string;
  taken: boolean;
  scheduledTime: Date;
  takenTime?: Date;
  notes?: string;
  createdAt: Date;
}

export interface Symptom {
  id: string;
  userId: string;
  symptom: string;
  severity: number;
  duration?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SleepLog {
  id: string;
  userId: string;
  sleepStart: Date;
  sleepEnd: Date;
  quality?: number;
  interruptions: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  activityType: string;
  duration: number;
  intensity: 'low' | 'moderate' | 'high';
  caloriesBurned?: number;
  heartRateAvg?: number;
  steps?: number;
  distance?: number;
  notes?: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NutritionLog {
  id: string;
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodItems: {
    name: string;
    portion: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }[];
  totalCalories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  waterIntake?: number;
  notes?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const healthService = {
  // Vital Signs
  async getVitalSigns(userId: string): Promise<VitalSign[]> {
    const { data, error } = await supabase
      .from('vital_signs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addVitalSign(vitalSign: Omit<VitalSign, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('vital_signs')
      .insert([vitalSign])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Medications
  async getMedications(userId: string): Promise<Medication[]> {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addMedication(medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('medications')
      .insert([medication])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMedication(
    id: string,
    medication: Partial<Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    const { data, error } = await supabase
      .from('medications')
      .update(medication)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Medication Logs
  async getMedicationLogs(medicationId: string): Promise<MedicationLog[]> {
    const { data, error } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('medication_id', medicationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addMedicationLog(log: Omit<MedicationLog, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('medication_logs')
      .insert([log])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Symptoms
  async getSymptoms(userId: string): Promise<Symptom[]> {
    const { data, error } = await supabase
      .from('symptoms')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addSymptom(symptom: Omit<Symptom, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('symptoms')
      .insert([symptom])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Sleep Logs
  async getSleepLogs(userId: string): Promise<SleepLog[]> {
    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addSleepLog(log: Omit<SleepLog, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('sleep_logs')
      .insert([log])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Activity Logs
  async getActivityLogs(userId: string): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addActivityLog(log: Omit<ActivityLog, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert([log])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateActivityLog(
    id: string,
    log: Partial<Omit<ActivityLog, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    const { data, error } = await supabase
      .from('activity_logs')
      .update(log)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Nutrition Logs
  async getNutritionLogs(userId: string): Promise<NutritionLog[]> {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addNutritionLog(log: Omit<NutritionLog, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .insert([log])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateNutritionLog(
    id: string,
    log: Partial<Omit<NutritionLog, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .update(log)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Realtime subscriptions
  subscribeToVitalSigns(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('vital_signs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vital_signs',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToMedications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('medications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToActivityLogs(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('activity_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_logs',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToNutritionLogs(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('nutrition_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nutrition_logs',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },
};
