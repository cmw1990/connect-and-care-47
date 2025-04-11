
import { UserProfile } from '@/types';

/**
 * Takes a query result and casts it to the proper type
 * This is useful for Supabase queries that return data that doesn't match the expected type
 */
export function castQueryResult<T>(result: any): T {
  return result as T;
}

/**
 * Creates a mock profile for current user
 */
export const mockCurrentUser = {
  id: 'current-user',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  role: 'caregiver',
};

/**
 * Utility for creating a mock profile
 */
export function createMockProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: `user-${Math.floor(Math.random() * 1000)}`,
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    avatar_url: 'https://avatar.vercel.sh/jane-smith',
    role: 'patient',
    ...overrides
  };
}

/**
 * Utility function to simulate async operations
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
