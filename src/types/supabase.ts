
import type { Database as GeneratedDatabase } from '@/integrations/supabase/types';
import type { PostgrestSingleResponse, PostgrestResponse as SupabaseResponse } from '@supabase/supabase-js';

export type Database = GeneratedDatabase;
export type Tables = Database['public']['Tables'];

// Message types
export interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: UserProfile;
}

// Insurance types
export interface InsuranceAnalytics {
  id: string;
  value: number;
  type: string;
  period?: string;
  created_at: string;
}

export interface InsuranceDeductible {
  id: string;
  insurance_id: string;
  total_amount: number;
  met_amount: number;
  deductible_type: string;
  year: number;
}

export interface InsuranceDocument {
  id: string;
  document_type: string;
  file_url: string;
  metadata: Record<string, any>;
  created_at: string;
  insurance_id?: string;
  user_id?: string;
}

// Dementia types
export interface DementiaProfile {
  id: string;
  user_id: string;
  stage?: 'early' | 'middle' | 'late';
  memory_support?: Record<string, any>;
  daily_routines?: Record<string, any>;
  communication_preferences?: Record<string, any>;
  primary_interests?: string[];
  behavioral_symptoms?: any[];
  cognitive_assessment_scores?: Record<string, any>;
  safety_concerns?: any[];
  medication_adherence?: Record<string, any>;
  preferred_activities?: any[];
  emotional_triggers?: any[];
  sleep_patterns?: Record<string, any>;
  updated_at?: string;
}

export interface DementiaTopicCard {
  id: string;
  title: string;
  content: string;
  category?: string;
  difficulty_level?: string;
  visual_aids?: string[];
  engagement_duration?: number;
  success_indicators?: string[];
}

export interface CognitiveExercise {
  id: string;
  title: string;
  description: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  category: 'memory' | 'attention' | 'language' | 'visual' | 'problem_solving';
  instructions: Record<string, any>;
  duration_minutes?: number;
  success_metrics?: any[];
  created_at: string;
}

export interface CognitiveExerciseProgress {
  id: string;
  profile_id: string;
  exercise_id: string;
  completion_time?: number;
  score?: number;
  difficulty_level?: string;
  notes?: string;
  created_at: string;
}

export interface BehaviorLog {
  id: string;
  profile_id: string;
  behavior_type: string;
  intensity: number;
  triggers?: string[];
  intervention_used?: string;
  intervention_success?: boolean;
  notes?: string;
  occurred_at: string;
  created_at: string;
}

export interface RoutineSchedule {
  id: string;
  profile_id: string;
  routine_type: string;
  schedule: Record<string, any>;
  completion_tracking?: Record<string, any>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Medication types
export interface MedicationSupervisionSummary {
  id: string;
  group_id: string;
  pending_verifications: number;
  total_medications: number;
  last_updated: string;
}

export interface MedicationScheduleBase {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  time_of_day: string[];
  group_id: string;
  instructions?: string;
  start_date?: string;
  end_date?: string;
}

export interface MedicationLogBase {
  id: string;
  schedule_id: string;
  taken_at: string;
  administered_at: string;
  status: 'taken' | 'missed' | 'pending' | 'pending_verification' | 'rejected';
  administered_by?: string;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  photo_verification_url?: string;
  medication_schedule?: MedicationScheduleBase;
}

export interface PostgrestResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface UserProfile {
  first_name: string | null;
  last_name: string | null;
}

export function isUserProfile(obj: any): obj is UserProfile {
  return obj && typeof obj.first_name !== 'undefined' && typeof obj.last_name !== 'undefined';
}

export type PostgrestQueryResponse<T> = SupabaseResponse<T>;
export type PostgrestSingleQueryResponse<T> = PostgrestSingleResponse<T>;

