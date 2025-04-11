
import { typeCast, transformData } from './typeHelpers';

/**
 * Mock supabase responses for development and type checking 
 * This is useful when tables referenced in components don't exist in the actual Supabase project yet.
 */
export const mockSupabase = {
  from: (tableName: string) => {
    // Return a mock that satisfies the Supabase interface but doesn't actually query the database
    return {
      select: (fields?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => ({ data: {}, error: null }),
          maybeSingle: async () => ({ data: {}, error: null }),
          limit: (limit: number) => ({
            order: (column: string, options?: { ascending?: boolean }) => ({
              range: (from: number, to: number) => ({
                select: (innerFields?: string, options?: { count?: string }) => 
                  Promise.resolve({ data: [], error: null, count: 0 }),
              }),
            }),
          }),
          get: async () => ({ data: [], error: null }),
        }),
        order: (column: string, options?: { ascending?: boolean }) => ({
          limit: (limit: number) => ({
            get: async () => ({ data: [], error: null }),
          }),
          get: async () => ({ data: [], error: null }),
        }),
        in: (column: string, values: any[]) => ({
          get: async () => ({ data: [], error: null }),
        }),
        contains: (column: string, values: any[]) => ({
          order: (column: string, options?: { ascending?: boolean }) => ({
            get: async () => ({ data: [], error: null }),
          }),
          get: async () => ({ data: [], error: null }),
        }),
        lte: (column: string, value: any) => ({
          get: async () => ({ data: [], error: null }),
        }),
        get: async () => ({ data: [], error: null }),
      }),
      insert: (data: any, options?: any) => 
        Promise.resolve({ data: null, error: null }),
      update: (data: any, options?: any) => ({
        eq: (column: string, value: any) => 
          Promise.resolve({ data: null, error: null }),
      }),
      delete: () => ({
        eq: (column: string, value: any) => 
          Promise.resolve({ data: null, error: null }),
      }),
    };
  },
};

/**
 * Transforms a Supabase response to a properly typed object
 * @param response The response from Supabase
 * @param defaultValue Default value to use if response is null or has an error
 * @returns The typed response data
 */
export function transformSupabaseResponse<T>(response: any, defaultValue: T): T {
  if (!response || response.error) {
    console.warn('Supabase response error or null:', response?.error);
    return defaultValue;
  }
  return typeCast<T>(response);
}

/**
 * Safe cast for Supabase queries that might fail due to missing tables
 * @param data Data with potential errors
 * @param mapper Optional mapping function
 * @returns Safely typed data
 */
export function safeSupabaseCast<T>(data: any, mapper?: (item: any) => T): T[] {
  if (!data || 'error' in data) {
    console.warn('Supabase data error:', data);
    return [];
  }
  
  if (!Array.isArray(data)) {
    return [];
  }
  
  return data.map(item => {
    if (mapper) {
      return mapper(item);
    }
    return item as T;
  });
}

/**
 * Helper to handle the infinite type recursion issue with Supabase
 * @param queryFn Function that performs the Supabase query
 * @returns The query result with proper types
 */
export async function safeSupabaseQuery<T>(queryFn: () => Promise<any>, defaultValue: T): Promise<T> {
  try {
    const result = await queryFn();
    if (result.error) {
      console.warn('Supabase query error:', result.error);
      return defaultValue;
    }
    return result.data as T;
  } catch (error) {
    console.error('Error in Supabase query:', error);
    return defaultValue;
  }
}

/**
 * Create a stub for a component that references a non-existent table
 * @returns A component that renders a placeholder
 */
export function createDatabaseStub<T>(tableName: string): () => T {
  console.warn(`Stubbing database access for table: ${tableName}`);
  return (() => {}) as unknown as () => T;
}
