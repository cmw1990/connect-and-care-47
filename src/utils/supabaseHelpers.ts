
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

/**
 * Helper function to safely cast Supabase query results to the expected type
 * This helps avoid TypeScript errors when the database schema doesn't match the expected types
 */
export function castQueryResult<T>(result: any): T[] {
  if (!result || !Array.isArray(result)) {
    return [] as T[];
  }
  return result as unknown as T[];
}

/**
 * Helper function for typecasting a query to avoid deep instantiation errors
 */
export function typeCastQuery<T>(query: any): Promise<PostgrestSingleResponse<T[]>> {
  return query as Promise<PostgrestSingleResponse<T[]>>;
}

/**
 * Create a mock profile for use when a relation lookup fails
 */
export const createMockProfile = (): { first_name: string; last_name: string } => {
  return {
    first_name: "Unknown",
    last_name: "User"
  };
};

/**
 * Create a mock user object for development and testing
 */
export const mockCurrentUser = {
  id: "user-1",
  email: "user@example.com",
  first_name: "Test",
  last_name: "User"
};
