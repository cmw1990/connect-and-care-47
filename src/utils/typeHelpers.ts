
/**
 * Helper function to cast an object to a specific type.
 * Useful for Supabase responses that may not match our exact type definitions.
 * 
 * @param obj The object to cast
 * @returns The same object casted to type T
 */
export function typeCast<T>(obj: any): T {
  return obj as T;
}

/**
 * Helper function to safely transform database objects to application objects.
 * This can be extended with validation or transformation logic as needed.
 * 
 * @param data Raw data from database
 * @param transformer Optional transformation function
 * @returns Transformed data of type T
 */
export function transformData<T, U = any>(
  data: U | U[] | null, 
  transformer?: (item: U) => T
): T | T[] | null {
  if (!data) return null;
  
  if (Array.isArray(data)) {
    return transformer 
      ? data.map(item => transformer(item)) 
      : data as unknown as T[];
  }
  
  return transformer 
    ? transformer(data) 
    : data as unknown as T;
}

/**
 * Helper to safely extract types from Supabase responses that have
 * deeply nested structures or potential query errors.
 * 
 * @param data Potentially nested data object
 * @param fallback Fallback value if data is invalid
 * @returns Extracted data of type T
 */
export function extractNestedData<T>(data: any, fallback: T): T {
  try {
    // Check if data exists and has an error property (error response from Supabase)
    if (!data || data.error) return fallback;
    
    return data as T;
  } catch (error) {
    console.error('Error extracting nested data:', error);
    return fallback;
  }
}
