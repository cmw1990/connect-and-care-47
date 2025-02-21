import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Utility functions for real-time subscriptions
export const subscribeToChannel = (
  channel: string,
  callback: (payload: any) => void
) => {
  const subscription = supabase
    .channel(channel)
    .on('postgres_changes', { event: '*', schema: 'public' }, callback)
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

// Helper function for error handling
export const handleError = (error: Error | null) => {
  if (error) {
    console.error('Supabase Error:', error.message);
    throw error;
  }
};

// Helper function for data transformation
export const transformResponse = <T>(data: T | null, error: Error | null): T => {
  handleError(error);
  if (!data) {
    throw new Error('No data returned from Supabase');
  }
  return data;
};

// Helper function for real-time presence
export const trackPresence = (
  channel: string,
  userId: string,
  status: 'online' | 'away' | 'offline'
) => {
  const presence = supabase.channel(channel);

  presence
    .on('presence', { event: 'sync' }, () => {
      const state = presence.presenceState();
      console.log('Presence state:', state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('Join:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('Leave:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presence.track({ user_id: userId, status });
      }
    });

  return () => {
    presence.unsubscribe();
  };
};

// Helper function for file uploads
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  handleError(error);
  if (!data) {
    throw new Error('Failed to upload file');
  }

  const { data: publicUrl } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl.publicUrl;
};

// Helper function for file downloads
export const downloadFile = async (
  bucket: string,
  path: string
): Promise<Blob> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  handleError(error);
  if (!data) {
    throw new Error('Failed to download file');
  }

  return data;
};

// Helper function for batch operations
export const batchOperation = async <T>(
  operations: Promise<T>[]
): Promise<T[]> => {
  try {
    return await Promise.all(operations);
  } catch (error) {
    handleError(error as Error);
    throw error;
  }
};

// Helper function for pagination
export type PaginationParams = {
  page?: number;
  limit?: number;
  order?: {
    column: string;
    ascending?: boolean;
  };
};

export const getPaginatedResults = async <T>(
  query: any,
  params: PaginationParams
): Promise<{
  data: T[];
  count: number;
  hasMore: boolean;
}> => {
  const {
    page = 1,
    limit = 10,
    order = { column: 'created_at', ascending: false },
  } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .order(order.column, { ascending: order.ascending })
    .range(from, to)
    .select('*', { count: 'exact' });

  handleError(error);
  if (!data) {
    throw new Error('No data returned from Supabase');
  }

  return {
    data,
    count: count || 0,
    hasMore: (count || 0) > to + 1,
  };
};

// Export types for better type inference
export type SupabaseClient = typeof supabase;
