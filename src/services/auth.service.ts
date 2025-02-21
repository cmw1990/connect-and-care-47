import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Tables } from '@/types/database.types';
import { handleError } from '@/lib/supabase/client';

export interface AuthUser extends User {
  profile?: Tables['users'];
}

class AuthService {
  private currentUser: AuthUser | null = null;

  constructor() {
    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        this.loadUserProfile(session?.user || null);
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
      }
    });
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (this.currentUser) return this.currentUser;

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;

    await this.loadUserProfile(session.user);
    return this.currentUser;
  }

  private async loadUserProfile(user: User | null) {
    if (!user) return;

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    handleError(error);

    this.currentUser = {
      ...user,
      profile: profile || undefined,
    };
  }

  async signUp(params: {
    email: string;
    password: string;
    fullName: string;
    role: Tables['users']['Row']['role'];
  }) {
    const { email, password, fullName, role } = params;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    handleError(authError);
    if (!authData.user) throw new Error('Failed to create user');

    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role,
        status: 'pending',
      });

    handleError(profileError);

    return authData;
  }

  async signIn(params: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword(params);
    handleError(error);
    if (data.user) {
      await this.loadUserProfile(data.user);
    }
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    handleError(error);
    this.currentUser = null;
  }

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    handleError(error);
  }

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    handleError(error);
  }

  async updateEmail(newEmail: string) {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });
    handleError(error);
  }

  async verifyOTP(params: { email: string; token: string }) {
    const { data, error } = await supabase.auth.verifyOtp(params);
    handleError(error);
    return data;
  }

  async linkProvider(provider: 'google' | 'apple' | 'facebook') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    handleError(error);
    return data;
  }

  async unlinkProvider(provider: 'google' | 'apple' | 'facebook') {
    const { error } = await supabase.auth.unlinkIdentity(provider);
    handleError(error);
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await this.loadUserProfile(session.user);
        callback(this.currentUser);
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
