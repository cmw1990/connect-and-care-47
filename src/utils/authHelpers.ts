
import { supabaseClient, getCurrentUser } from '@/integrations/supabaseClient';

export interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

/**
 * A function to get the current user with correct property names
 * This fixes the issues with accessing properties like .id, .first_name, etc.
 */
export const getUser = async (): Promise<User | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    first_name: user.first_name,
    last_name: user.last_name,
    created_at: user.created_at
  };
};

/**
 * A wrapper function that returns a user object synchronously for component initialization
 * Should be used only where you need an immediate return and plan to update the state later
 */
export const getUserSync = (): User => {
  // Return the user object directly, not a function
  return {
    id: '',
    email: '',
    role: '',
    firstName: '',
    lastName: '',
    first_name: '',
    last_name: '',
    created_at: new Date().toISOString()
  };
};

/**
 * Updates components that are using the old user object structure
 * This should be used in useEffect to update state once the real user data is fetched
 */
export const updateUserState = async (setUser: (user: User) => void) => {
  try {
    const user = await getUser();
    if (user) {
      setUser(user);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};
