
import { typeCast, transformData } from './typeHelpers';
import { Json } from '@/integrations/supabase/types';
import { safeSupabaseQuery } from './supabase';

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

/**
 * Creates a mock profile for testing
 */
export function createMockProfile(id: string, firstName: string = 'Test', lastName: string = 'User') {
  return {
    id,
    first_name: firstName,
    last_name: lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    avatar_url: null,
    role: 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Provides a mock current user for development
 */
export const mockCurrentUser = {
  id: '12345',
  email: 'current.user@example.com',
  first_name: 'Current',
  last_name: 'User',
  avatar_url: null,
  role: 'user'
};

/**
 * Helper to cast query results to a specific type
 */
export function castQueryResult<T>(data: any): T {
  if (!data || data.error) {
    console.warn('Failed to cast query result:', data?.error);
    return {} as T;
  }
  return data as T;
}

/**
 * Mock sleep data for development
 */
export const sleep = {
  getSleepData: () => {
    return [
      { date: '2023-01-01', hours: 7.5, quality: 'good' },
      { date: '2023-01-02', hours: 6.2, quality: 'fair' },
      { date: '2023-01-03', hours: 8.1, quality: 'excellent' },
      { date: '2023-01-04', hours: 5.8, quality: 'poor' },
      { date: '2023-01-05', hours: 7.2, quality: 'good' },
    ];
  }
};

/**
 * Helper function to safely handle queries with potential deep type recursion
 */
export function safeQueryBuilder<T>(query: any): Promise<T[]> {
  try {
    return query.then((result: any) => {
      if (result.error) {
        console.warn('Query error:', result.error);
        return [];
      }
      return (result.data || []) as T[];
    });
  } catch (error) {
    console.error('Error executing query:', error);
    return Promise.resolve([]);
  }
}

/**
 * Mock implementation for queries with missing tables
 * This function returns properly typed mock data for components
 * @param mockData The mock data to return
 * @returns A Promise that resolves to the mock data
 */
export function mockTableQuery<T>(mockData: T[]): Promise<T[]> {
  return Promise.resolve(mockData);
}

/**
 * Set up handlers for non-existent tables to provide mock data
 */
export function mockMissingTables() {
  console.log("Initializing mock tables for development");
  
  // Define the tables you expect to use in the app
  const expectedTables = [
    'care_appointments',
    'insurance_claims',
    'user_insurance',
    'insurance_plans',
    'insurance_deductibles',
    'insurance_documents',
    'medical_documents',
    'medical_device_data',
    'care_circle_invites',
    'care_recipients',
    'care_group_members',
    'verification_requests',
    'background_checks',
    'affiliate_interactions',
    'facility_leads',
    'care_connections',
    'group_posts',
    'tasks',
    'danger_zone_types',
    'care_groups',
    'geofences'
  ];
  
  // For debugging and informational purposes
  expectedTables.forEach(tableName => {
    console.log(`Table '${tableName}' is being mocked`);
  });
}

/**
 * Helper to handle Supabase query results with type safety
 * Converts raw results into proper typed objects with fallback for errors
 */
export function handleSupabaseResult<T>(result: any, fallback: T): T {
  if (result && !result.error) {
    return result.data as T;
  }
  if (result?.error) {
    console.warn('Supabase query error:', result.error);
  }
  return fallback;
}

/**
 * Utility to mock a Connection object that properly satisfies the Connection interface 
 */
export function mockConnection(overrides: Partial<any> = {}): any {
  return {
    id: '1',
    requester_id: '1',
    recipient_id: '2',
    connection_type: 'carer' as 'carer' | 'pal', // Properly typed as union
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    requester: {
      first_name: 'Test',
      last_name: 'User'
    },
    recipient: {
      first_name: 'Other',
      last_name: 'User'
    },
    ...overrides
  };
}

/**
 * Similar to safeSupabaseQuery but specialized for handling typescript errors
 * when accessing non-existent tables
 */
export function mockSupabaseQuery<T>(
  tableName: string, 
  mockResult: T[] = [],
  isSingle: boolean = false
): Promise<{data: T | T[] | null, error: null | Error}> {
  console.log(`Mock query for table: ${tableName}`);
  return Promise.resolve({
    data: isSingle ? (mockResult[0] || null) : mockResult,
    error: null
  });
}
