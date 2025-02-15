
import { Database } from '@/integrations/supabase/types'

export type DatabaseSchema = Database['public']['Tables']

// Shared profile type
export interface UserProfile {
  first_name: string | null;
  last_name: string | null;
}

// Insurance types
export interface InsuranceAnalytics {
  id: string;
  user_id: string;
  metrics: {
    claims_submitted: number;
    claims_approved: number;
    total_cost: number;
    out_of_pocket: number;
    created_at: string;
  };
}

export interface InsuranceDeductible {
  id: string;
  insurance_id: string;
  deductible_type: string;
  total_amount: number;
  met_amount: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  provider_name: string;
  specialty: string;
  network_status: 'in-network' | 'out-of-network';
  accepting_new_patients: boolean;
  rating?: number;
  locations: Array<{
    address: string;
    phone: string;
  }>;
}

export interface ProviderSearchFilters {
  specialty?: string;
  locations?: string[];
  network_status?: 'in-network' | 'out-of-network';
  accepting_new_patients?: boolean;
  distance?: number;
}

// Message types
export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: UserProfile;
}

// Care Update types
export interface CareUpdate {
  id: string;
  content: string;
  update_type: string;
  created_at: string;
  profiles: UserProfile;
}

// Post types
export interface Post {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  profiles?: UserProfile;
}

// Task types
export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  assigned_user: UserProfile | null;
}

// Insurance Document types
export interface InsuranceDocument {
  id: string;
  user_id: string;
  document_type: string;
  file_url: string;
  uploaded_at: string;
  metadata: {
    filename: string;
    size: number;
    type: string;
  };
}

// Medication types
export interface MedicationScheduleBase {
  id: string;
  medication_name: string;
  dosage: string;
  time_of_day: string[];
  group_id: string;
  frequency: string;
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

export interface MedicationReminderPreferences {
  voice_reminders: boolean;
  preferred_voice?: string;
  preferred_channels?: string[];
}

export interface MedicationPortalSettings {
  id: string;
  group_id: string;
  reminder_preferences: MedicationReminderPreferences;
  accessibility_settings: {
    voice_reminders: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

// Tables type for Supabase client
export interface Tables {
  care_updates: {
    Row: CareUpdate;
    Insert: Omit<CareUpdate, 'id' | 'created_at'>;
    Update: Partial<Omit<CareUpdate, 'id'>>;
  };
  team_messages: {
    Row: Message;
    Insert: Omit<Message, 'id' | 'created_at'>;
    Update: Partial<Omit<Message, 'id'>>;
  };
  // Add other table definitions as needed
}

// Helper type guards
export function isUserProfile(obj: any): obj is UserProfile {
  return obj && typeof obj.first_name !== 'undefined' && typeof obj.last_name !== 'undefined';
}

export function isSingleItemArray<T>(arr: T | T[]): arr is T[] {
  return Array.isArray(arr) && arr.length === 1;
}

// Helper function to safely transform Supabase responses
export function transformSupabaseResponse<T>(data: any): T {
  if (!data) return data;
  
  // If it's an array, transform each item
  if (Array.isArray(data)) {
    return data.map(item => transformSupabaseResponse<T>(item)) as unknown as T;
  }

  // If it has a nested profiles array with one item, convert it to an object
  if (data.profiles && Array.isArray(data.profiles) && data.profiles.length === 1) {
    return {
      ...data,
      profiles: data.profiles[0]
    } as T;
  }

  // If it has a nested sender array with one item, convert it to an object
  if (data.sender && Array.isArray(data.sender) && data.sender.length === 1) {
    return {
      ...data,
      sender: data.sender[0]
    } as T;
  }

  // If it has a nested assigned_user array with one item, convert it to an object
  if (data.assigned_user && Array.isArray(data.assigned_user) && data.assigned_user.length === 1) {
    return {
      ...data,
      assigned_user: data.assigned_user[0]
    } as T;
  }

  return data as T;
}

// Helper function for network status conversion
export function networkStatusToDisplay(status: 'in-network' | 'out-of-network'): string {
  return status === 'in-network' ? 'In-Network' : 'Out-of-Network';
}
