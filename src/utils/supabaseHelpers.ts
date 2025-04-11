
import { v4 as uuidv4 } from 'uuid';
import { supabaseClient } from '@/integrations/supabaseClient';
import { Json } from '@/types/database.types';

/**
 * Interface for Supabase response
 */
export interface MockSupabaseResponse<T> {
  data: T[];
  error: null | {
    message: string;
  };
}

/**
 * Type for SelectQueryError
 */
export type SelectQueryError<T> = {
  error: true;
} & String;

/**
 * Creates a mock user profile for testing
 */
export function createMockProfile(options: {
  firstName?: string;
  lastName?: string;
  role?: string;
}) {
  return {
    id: uuidv4(),
    first_name: options.firstName || 'John',
    last_name: options.lastName || 'Doe',
    role: options.role || 'caregiver',
    email: `${options.firstName || 'john'}.${options.lastName || 'doe'}@example.com`.toLowerCase(),
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Creates a mock current user for testing
 */
export function mockCurrentUser() {
  return {
    id: uuidv4(),
    email: 'current.user@example.com',
    role: 'admin',
    firstName: 'Current',
    lastName: 'User',
    created_at: new Date().toISOString()
  };
}

/**
 * Mocks a table query for development and testing
 */
export async function mockTableQuery<T>(
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
 * Cast query result to expected type
 */
export function castQueryResult<T>(data: any): T[] {
  return data as T[];
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
    return await mockTableQuery(tableName, mockData);
  }
}

/**
 * Transforms connection data to match Connection type
 */
export function transformConnectionData(data: any[]): any[] {
  return data.map(item => ({
    ...item,
    connection_type: item.connection_type as 'carer' | 'pal'
  }));
}

/**
 * Transforms document data to match Document type
 */
export function transformDocumentData(data: any[]): any[] {
  return data.map(item => ({
    id: item.id,
    title: item.title || 'Untitled Document',
    description: item.description || '',
    file_url: item.file_url || '',
    document_type: item.document_type || 'document',
    created_by: item.created_by || '',
    created_at: item.created_at || new Date().toISOString()
  }));
}

/**
 * Transforms care recipient data to match CareRecipient type
 */
export function transformRecipientData(data: any[]): any[] {
  return data.map(item => ({
    id: item.id,
    first_name: item.first_name,
    last_name: item.last_name,
    date_of_birth: item.date_of_birth || '',
    care_needs: Array.isArray(item.care_needs) ? item.care_needs : [],
    preferences: item.preferences || {},
    created_at: item.created_at,
    updated_at: item.updated_at,
    medical_conditions: [],
    allergies: [],
    special_requirements: []
  }));
}
