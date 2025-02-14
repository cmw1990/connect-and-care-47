
import { Database } from '@/integrations/supabase/types'

export type DatabaseSchema = Database['public']['Tables']

// Shared profile type
export interface UserProfile {
  first_name: string | null;
  last_name: string | null;
}

// Message types
export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: UserProfile | null;
}

// Care Update types
export interface CareUpdate {
  id: string;
  content: string;
  update_type: string;
  created_at: string;
  profiles: UserProfile | null;
}

// Post types
export interface Post {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  profiles?: UserProfile | null;
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
  file_url: string;
  document_type: string;
  metadata: {
    filename: string;
    size: number;
    type: string;
  };
  uploaded_at: string;
}

// Insurance Plan types
export interface InsurancePlan {
  id: string;
  name: string;
  type: string;
  covered_services: Record<string, boolean>;
  auto_verification: boolean;
}

// Care Report types
export interface CareReport {
  id: string;
  recorded_at: string;
  metric_value: {
    notes: string;
    timestamp: string;
  };
  created_by: string;
  profiles: UserProfile | null;
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
