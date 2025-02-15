
import { supabase } from "@/integrations/supabase/client";
import type { PostgrestResponse } from '@/types/supabase';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export async function supabaseQueryWithTransform<T>(
  query: PostgrestFilterBuilder<any, any, T>
): Promise<PostgrestResponse<T>> {
  try {
    const { data, error } = await query;
    
    if (error) {
      return { data: null, error };
    }

    if (Array.isArray(data)) {
      const transformed = data.map(item => transformObject<T>(item));
      return { data: transformed as unknown as T, error: null };
    }

    return { 
      data: transformObject<T>(data),
      error: null
    };
  } catch (error) {
    console.error('Error in supabaseQueryWithTransform:', error);
    return { data: null, error: error as Error };
  }
}

export function transformObject<T>(obj: any): T {
  if (!obj) return obj;
  const transformed = { ...obj };

  // Transform arrays of profiles/sender/assigned_user into single objects
  if (transformed.profiles && Array.isArray(transformed.profiles) && transformed.profiles.length === 1) {
    transformed.profiles = transformed.profiles[0];
  }

  if (transformed.sender && Array.isArray(transformed.sender) && transformed.sender.length === 1) {
    transformed.sender = transformed.sender[0];
  }

  if (transformed.assigned_user && Array.isArray(transformed.assigned_user) && transformed.assigned_user.length === 1) {
    transformed.assigned_user = transformed.assigned_user[0];
  }

  // Convert any Json types to proper objects
  if (transformed.metadata && typeof transformed.metadata === 'string') {
    try {
      transformed.metadata = JSON.parse(transformed.metadata);
    } catch (e) {
      transformed.metadata = {};
    }
  }

  if (transformed.reminder_preferences && typeof transformed.reminder_preferences === 'string') {
    try {
      transformed.reminder_preferences = JSON.parse(transformed.reminder_preferences);
    } catch (e) {
      transformed.reminder_preferences = { voice_reminders: false, preferred_channels: [] };
    }
  }

  return transformed as T;
}
