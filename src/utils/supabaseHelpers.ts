
import { v4 as uuidv4 } from 'uuid';

export interface MockSupabaseResponse<T> {
  data: T[];
  error: null | {
    message: string;
  };
}

/**
 * Mock Supabase query for development and testing
 */
export async function mockSupabaseQuery<T>(
  table: string,
  mockData: T[]
): Promise<MockSupabaseResponse<T>> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    data: mockData,
    error: null
  };
}

/**
 * Creates a mock connection for testing
 */
export function mockConnection(options: {
  status?: string;
  connection_type?: 'carer' | 'pal';
  first_name?: string;
  last_name?: string;
}) {
  const id = uuidv4();
  return {
    id,
    requester_id: uuidv4(),
    recipient_id: uuidv4(),
    connection_type: options.connection_type || 'carer',
    status: options.status || 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    requester: {
      first_name: options.first_name || 'John',
      last_name: options.last_name || 'Doe'
    },
    recipient: {
      first_name: 'Jane',
      last_name: 'Smith'
    }
  };
}

/**
 * Safely access Supabase tables
 * Will try real table first, then fallback to mock data if error
 */
export async function safeSupabaseQuery<T>(
  tableName: string,
  queryFn: () => Promise<any>,
  mockData: T[]
): Promise<{ data: T[], error: any }> {
  try {
    const result = await queryFn();
    return result;
  } catch (error) {
    console.warn(`Error accessing ${tableName} table, using mock data:`, error);
    return await mockSupabaseQuery(tableName, mockData);
  }
}
