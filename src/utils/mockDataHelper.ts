
import { supabase } from "@/integrations/supabase/client";
import { PostgrestFilterBuilder, PostgrestSingleResponse } from "@supabase/supabase-js";
import { createMockProfile } from "@/utils/supabaseHelpers";

/**
 * Helper function to create mock data for a component that's trying to query a non-existent table
 * This prevents type errors when components expect data from Supabase
 */
export function createMockQuery<T>(mockData: T[]): {
  eq: () => { 
    order: () => { 
      select: () => Promise<PostgrestSingleResponse<T[]>>
    } 
  }
} {
  return {
    eq: () => ({ 
      order: () => ({
        select: async () => ({ 
          data: mockData, 
          error: null, 
          count: mockData.length, 
          status: 200,
          statusText: 'OK' 
        })
      })
    })
  };
}

/**
 * Provides a safe mock implementation for database queries that can't be found
 * @param mockData Data to return for the query
 */
export function mockSupabaseFrom<T>(mockData: T[]) {
  return {
    select: () => ({
      eq: () => ({
        order: () => ({
          limit: () => ({
            then: (callback: (result: PostgrestSingleResponse<T[]>) => void) => {
              callback({
                data: mockData,
                error: null,
                count: mockData.length,
                status: 200,
                statusText: 'OK'
              });
              return Promise.resolve();
            }
          })
        })
      })
    }),
    insert: () => ({
      select: () => Promise.resolve({
        data: mockData,
        error: null,
        count: mockData.length,
        status: 201,
        statusText: 'Created'
      })
    }),
    update: () => ({
      eq: () => Promise.resolve({
        data: mockData,
        error: null,
        count: mockData.length,
        status: 200,
        statusText: 'OK'
      })
    }),
    delete: () => ({
      eq: () => Promise.resolve({
        data: [],
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK'
      })
    })
  };
}

/**
 * Creates mock UserProfile data for components that expect sender/receiver profiles
 */
export function createMockUserProfile(): { first_name: string; last_name: string } {
  return {
    first_name: "Mock",
    last_name: "User"
  };
}

/**
 * Creates mock Message data with proper UserProfile structure
 */
export function createMockMessages(count: number = 3): Array<{
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender: { first_name: string; last_name: string };
  role?: "user" | "assistant";
}> {
  return Array(count).fill(null).map((_, index) => ({
    id: `msg-${index}`,
    content: `This is a mock message ${index + 1}`,
    sender_id: `user-${index % 2 + 1}`,
    created_at: new Date(Date.now() - index * 60000).toISOString(),
    sender: {
      first_name: index % 2 === 0 ? "John" : "Jane",
      last_name: "Doe"
    },
    role: index % 2 === 0 ? "user" : "assistant" 
  }));
}

/**
 * Creates a typecast wrapper to properly cast objects to expected types
 */
export function typeCastObject<T>(obj: any): T {
  return obj as unknown as T;
}
