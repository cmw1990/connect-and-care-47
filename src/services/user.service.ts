import { supabase } from '@/lib/supabase/client';
import { Tables } from '@/types/database.types';
import { fileService } from './file.service';
import { analyticsService } from './analytics.service';
import { notificationService } from './notification.service';

export type UserProfile = Tables['users']['Row'] & {
  careTeams?: Tables['care_teams']['Row'][];
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
    accessibility?: {
      fontSize?: 'small' | 'medium' | 'large';
      contrast?: 'normal' | 'high';
      reduceMotion?: boolean;
    };
    language?: string;
    timezone?: string;
  };
};

export type UserRole = Tables['users']['Row']['role'];

class UserService {
  private userCache: Map<string, UserProfile> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    return this.getUserProfile(user.id);
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    // Check cache first
    const cachedUser = this.userCache.get(userId);
    if (cachedUser) return cachedUser;

    // Get user profile
    const { data: profile, error } = await supabase
      .from('users')
      .select(`
        *,
        care_teams:care_teams(*)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!profile) return null;

    // Cache the profile
    this.userCache.set(userId, profile);
    setTimeout(() => this.userCache.delete(userId), this.cacheTimeout);

    return profile;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: updates.full_name,
        avatar_url: updates.avatar_url,
        preferences: updates.preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Update cache
    this.userCache.delete(userId);

    // Track profile update
    analyticsService.trackEvent({
      category: 'user',
      action: 'update_profile',
      label: userId,
    });

    return data;
  }

  async updateAvatar(userId: string, file: File): Promise<string> {
    // Upload avatar
    const fileMetadata = await fileService.uploadFile(file, 'profile', {
      userId,
      purpose: 'avatar',
    });

    // Update user profile
    const { data, error } = await supabase
      .from('users')
      .update({
        avatar_url: fileMetadata.url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Update cache
    this.userCache.delete(userId);

    return fileMetadata.url!;
  }

  async updatePreferences(userId: string, preferences: UserProfile['preferences']): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    // Update cache
    this.userCache.delete(userId);

    // Track preference update
    analyticsService.trackEvent({
      category: 'user',
      action: 'update_preferences',
      label: userId,
      metadata: { preferences },
    });
  }

  async searchUsers(query: string, role?: UserRole): Promise<UserProfile[]> {
    let dbQuery = supabase
      .from('users')
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('full_name', { ascending: true });

    if (role) {
      dbQuery = dbQuery.eq('role', role);
    }

    const { data, error } = await dbQuery;

    if (error) throw error;
    return data;
  }

  async getUsersByRole(role: UserRole): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data;
  }

  async addUserToCareTeam(params: {
    userId: string;
    careTeamId: string;
    role: Tables['care_team_members']['Row']['role'];
    permissions?: string[];
  }): Promise<void> {
    const { userId, careTeamId, role, permissions = [] } = params;

    const { error } = await supabase
      .from('care_team_members')
      .insert({
        user_id: userId,
        care_team_id: careTeamId,
        role,
        permissions,
      });

    if (error) throw error;

    // Notify user
    await notificationService.create({
      userId,
      type: 'care_team',
      title: 'Added to Care Team',
      message: 'You have been added to a new care team',
      data: { careTeamId },
    });

    // Track event
    analyticsService.trackEvent({
      category: 'care_team',
      action: 'add_member',
      label: careTeamId,
      metadata: { userId, role },
    });
  }

  async removeUserFromCareTeam(userId: string, careTeamId: string): Promise<void> {
    const { error } = await supabase
      .from('care_team_members')
      .delete()
      .eq('user_id', userId)
      .eq('care_team_id', careTeamId);

    if (error) throw error;

    // Notify user
    await notificationService.create({
      userId,
      type: 'care_team',
      title: 'Removed from Care Team',
      message: 'You have been removed from a care team',
      data: { careTeamId },
    });

    // Track event
    analyticsService.trackEvent({
      category: 'care_team',
      action: 'remove_member',
      label: careTeamId,
      metadata: { userId },
    });
  }

  async getUserCareTeams(userId: string): Promise<Tables['care_teams']['Row'][]> {
    const { data, error } = await supabase
      .from('care_team_members')
      .select(`
        care_teams:care_team_id(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(item => item.care_teams);
  }

  async getUserPermissions(userId: string, careTeamId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('care_team_members')
      .select('permissions')
      .eq('user_id', userId)
      .eq('care_team_id', careTeamId)
      .single();

    if (error) throw error;
    return data?.permissions || [];
  }

  async updateUserStatus(userId: string, status: Tables['users']['Row']['status']): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    // Update cache
    this.userCache.delete(userId);

    // Track status update
    analyticsService.trackEvent({
      category: 'user',
      action: 'update_status',
      label: userId,
      metadata: { status },
    });
  }

  async deactivateUser(userId: string): Promise<void> {
    await this.updateUserStatus(userId, 'inactive');

    // Notify user
    await notificationService.create({
      userId,
      type: 'system',
      title: 'Account Deactivated',
      message: 'Your account has been deactivated',
      priority: 'high',
    });
  }

  async reactivateUser(userId: string): Promise<void> {
    await this.updateUserStatus(userId, 'active');

    // Notify user
    await notificationService.create({
      userId,
      type: 'system',
      title: 'Account Reactivated',
      message: 'Your account has been reactivated',
      priority: 'high',
    });
  }
}

export const userService = new UserService();
