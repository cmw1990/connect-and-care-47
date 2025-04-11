
import { v4 as uuidv4 } from 'uuid';
import { supabaseClient, safeQueryWithFallback } from '@/integrations/supabaseClient';
import { Json } from '@/types/database.types';
import type { CareRecipient, Connection, Document, Post, Task } from '@/types/database.types';

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
): Promise<{ data: T[]; error: null }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    data: mockData,
    error: null
  };
}

/**
 * Mocks a Supabase query with fallback data
 */
export async function mockSupabaseQuery<T>(
  tableName: string,
  mockData: T[]
): Promise<{ data: T[] | null; error: any }> {
  return { data: mockData, error: null };
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
}): Connection {
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
 * Creates a mock message for testing 
 */
export function createMockMessage(options: {
  content: string;
  sender_id: string;
  sender: {
    first_name: string;
    last_name: string;
  };
}) {
  return {
    id: uuidv4(),
    content: options.content,
    sender_id: options.sender_id,
    sender: options.sender,
    created_at: new Date().toISOString()
  };
}

/**
 * Creates a mock user profile
 */
export function createMockUserProfile(options: {
  id?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}) {
  return {
    id: options.id || uuidv4(),
    first_name: options.first_name || 'Test',
    last_name: options.last_name || 'User',
    role: options.role || 'user',
    email: `${options.first_name || 'test'}.${options.last_name || 'user'}@example.com`.toLowerCase(),
    created_at: new Date().toISOString()
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
): Promise<{ data: T[]; error: any }> {
  try {
    const result = await queryFn();
    if (result.error) {
      console.warn(`Error accessing ${tableName} table, using mock data:`, result.error);
      return await mockTableQuery(tableName, mockData);
    }
    return result;
  } catch (error) {
    console.warn(`Error accessing ${tableName} table, using mock data:`, error);
    return await mockTableQuery(tableName, mockData);
  }
}

/**
 * Transforms connection data to match Connection type
 */
export function transformConnectionData(data: any[]): Connection[] {
  return data.map(item => ({
    ...item,
    connection_type: item.connection_type as 'carer' | 'pal',
    requester: {
      first_name: item.requester?.first_name || 'Unknown',
      last_name: item.requester?.last_name || 'User'
    },
    recipient: {
      first_name: item.recipient?.first_name || 'Unknown',
      last_name: item.recipient?.last_name || 'User'
    }
  }));
}

/**
 * Transforms document data to match Document type
 */
export function transformDocumentData(data: any[]): Document[] {
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
 * Transforms task data to match Task type
 */
export function transformTaskData(data: any[]): Task[] {
  return data.map(item => ({
    id: item.id || uuidv4(),
    title: item.title || 'Untitled Task',
    due_date: item.due_date || new Date().toISOString(),
    status: item.status || 'pending',
    priority: item.priority || 'medium',
    assigned_to: item.assigned_to || '',
    assigned_user: item.assigned_user || {
      first_name: 'Unassigned',
      last_name: ''
    }
  }));
}

/**
 * Transforms post data to match Post type
 */
export function transformPostData(data: any[]): Post[] {
  return data.map(item => ({
    id: item.id || uuidv4(),
    content: item.content || '',
    created_at: item.created_at || new Date().toISOString(),
    created_by: item.created_by || '',
    profiles: item.profiles || {
      first_name: 'Unknown',
      last_name: 'User'
    }
  }));
}

/**
 * Transforms care recipient data to match CareRecipient type
 */
export function transformRecipientData(data: any[]): CareRecipient[] {
  return data.map(item => ({
    id: item.id,
    first_name: item.first_name,
    last_name: item.last_name || '',
    date_of_birth: item.date_of_birth || '',
    care_needs: Array.isArray(item.care_needs) ? item.care_needs : [],
    preferences: item.preferences || {},
    created_at: item.created_at,
    updated_at: item.updated_at,
    group_id: item.group_id,
    medical_conditions: [],
    allergies: [],
    special_requirements: []
  }));
}
