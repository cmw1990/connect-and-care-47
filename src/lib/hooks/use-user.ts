
import { useState } from 'react';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

// Mock user data for development
const mockUser: User = {
  id: 'user-1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  role: 'caregiver'
};

export const useUser = () => {
  const [user, setUser] = useState<User | null>(mockUser);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // This would normally authenticate with Supabase
      setUser(mockUser);
      return { user: mockUser, error: null };
    } catch (error) {
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // This would normally sign out of Supabase
    setUser(null);
    return { error: null };
  };

  const getUser = () => {
    return user;
  };

  return { user, loading, login, logout, getUser };
};
