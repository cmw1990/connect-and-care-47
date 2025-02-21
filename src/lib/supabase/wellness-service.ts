import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface MoodLog {
  id: string;
  userId: string;
  moodScore: number;
  energyLevel: number;
  stressLevel: number;
  anxietyLevel: number;
  activities?: string[];
  triggers?: string[];
  copingStrategies?: string[];
  notes?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WellnessGoal {
  id: string;
  userId: string;
  category: string;
  title: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  startDate: Date;
  targetDate?: Date;
  status: 'active' | 'completed' | 'abandoned';
  reminders: boolean;
  reminderFrequency?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
    emergencyOnly: boolean;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyIncident {
  id: string;
  userId: string;
  incidentType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  locationData?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  description?: string;
  status: 'active' | 'resolved';
  resolvedAt?: Date;
  resolutionNotes?: string;
  contactsNotified?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WellnessResource {
  id: string;
  title: string;
  category: string;
  contentType: 'article' | 'video' | 'audio' | 'exercise';
  content: string;
  tags?: string[];
  author?: string;
  externalUrl?: string;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceInteraction {
  id: string;
  userId: string;
  resourceId: string;
  interactionType: 'view' | 'save' | 'complete' | 'rate';
  rating?: number;
  feedback?: string;
  createdAt: Date;
}

export const wellnessService = {
  // Mood Logs
  async getMoodLogs(userId: string): Promise<MoodLog[]> {
    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addMoodLog(log: Omit<MoodLog, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('mood_logs')
      .insert([log])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Wellness Goals
  async getWellnessGoals(userId: string): Promise<WellnessGoal[]> {
    const { data, error } = await supabase
      .from('wellness_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addWellnessGoal(goal: Omit<WellnessGoal, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('wellness_goals')
      .insert([goal])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateWellnessGoal(
    id: string,
    goal: Partial<Omit<WellnessGoal, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    const { data, error } = await supabase
      .from('wellness_goals')
      .update(goal)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Emergency Contacts
  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addEmergencyContact(contact: Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert([contact])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateEmergencyContact(
    id: string,
    contact: Partial<Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .update(contact)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Emergency Incidents
  async getEmergencyIncidents(userId: string): Promise<EmergencyIncident[]> {
    const { data, error } = await supabase
      .from('emergency_incidents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addEmergencyIncident(incident: Omit<EmergencyIncident, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('emergency_incidents')
      .insert([incident])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateEmergencyIncident(
    id: string,
    incident: Partial<Omit<EmergencyIncident, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    const { data, error } = await supabase
      .from('emergency_incidents')
      .update(incident)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Wellness Resources
  async getWellnessResources(category?: string): Promise<WellnessResource[]> {
    let query = supabase.from('wellness_resources').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getResourceInteractions(userId: string, resourceId?: string): Promise<ResourceInteraction[]> {
    let query = supabase
      .from('user_resource_interactions')
      .select('*')
      .eq('user_id', userId);
    
    if (resourceId) {
      query = query.eq('resource_id', resourceId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addResourceInteraction(interaction: Omit<ResourceInteraction, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('user_resource_interactions')
      .insert([interaction])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Realtime subscriptions
  subscribeMoodLogs(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('mood_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mood_logs',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeEmergencyIncidents(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('emergency_incidents_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_incidents',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },
};
