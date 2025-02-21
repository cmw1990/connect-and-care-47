import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface CareTeam {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  primaryCaregiver?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface CareTeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: string;
  permissions: {
    canManageTeam: boolean;
    canCreateTasks: boolean;
    canAssignTasks: boolean;
    canEditSchedule: boolean;
    canAccessMedical: boolean;
  };
  status: 'active' | 'inactive';
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CareTask {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  dueDate?: Date;
  completionNotes?: string;
  completedAt?: Date;
  completedBy?: string;
  recurring: boolean;
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    endDate?: Date;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CareNote {
  id: string;
  teamId: string;
  authorId: string;
  category: string;
  content: string;
  tags?: string[];
  visibility: 'team' | 'medical' | 'private';
  attachments?: {
    url: string;
    type: string;
    name: string;
    size: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CareTeamMessage {
  id: string;
  teamId: string;
  senderId: string;
  messageType: 'text' | 'image' | 'file' | 'alert';
  content: string;
  attachments?: {
    url: string;
    type: string;
    name: string;
    size: number;
  }[];
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CareSchedule {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  scheduleType: string;
  startDate: Date;
  endDate?: Date;
  recurring: boolean;
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    endDate?: Date;
  };
  assignedTo: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const careTeamService = {
  // Care Teams
  async getCareTeams(userId: string): Promise<CareTeam[]> {
    const { data, error } = await supabase
      .from('care_teams')
      .select('*, care_team_members!inner(*)')
      .eq('care_team_members.user_id', userId)
      .eq('care_team_members.status', 'active');

    if (error) throw error;
    return data;
  },

  async createCareTeam(team: Omit<CareTeam, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('care_teams')
      .insert([team])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCareTeam(
    id: string,
    team: Partial<Omit<CareTeam, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    const { data, error } = await supabase
      .from('care_teams')
      .update(team)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Team Members
  async getTeamMembers(teamId: string): Promise<CareTeamMember[]> {
    const { data, error } = await supabase
      .from('care_team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('status', 'active');

    if (error) throw error;
    return data;
  },

  async addTeamMember(member: Omit<CareTeamMember, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('care_team_members')
      .insert([member])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTeamMember(
    id: string,
    member: Partial<Omit<CareTeamMember, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    const { data, error } = await supabase
      .from('care_team_members')
      .update(member)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Care Tasks
  async getCareTasks(teamId: string): Promise<CareTask[]> {
    const { data, error } = await supabase
      .from('care_tasks')
      .select('*')
      .eq('team_id', teamId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createCareTask(task: Omit<CareTask, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('care_tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCareTask(
    id: string,
    task: Partial<Omit<CareTask, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    const { data, error } = await supabase
      .from('care_tasks')
      .update(task)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Care Notes
  async getCareNotes(teamId: string): Promise<CareNote[]> {
    const { data, error } = await supabase
      .from('care_notes')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createCareNote(note: Omit<CareNote, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('care_notes')
      .insert([note])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Team Messages
  async getTeamMessages(teamId: string): Promise<CareTeamMessage[]> {
    const { data, error } = await supabase
      .from('care_team_messages')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async sendTeamMessage(message: Omit<CareTeamMessage, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('care_team_messages')
      .insert([message])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Care Schedules
  async getCareSchedules(teamId: string): Promise<CareSchedule[]> {
    const { data, error } = await supabase
      .from('care_schedules')
      .select('*')
      .eq('team_id', teamId)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createCareSchedule(schedule: Omit<CareSchedule, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('care_schedules')
      .insert([schedule])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCareSchedule(
    id: string,
    schedule: Partial<Omit<CareSchedule, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    const { data, error } = await supabase
      .from('care_schedules')
      .update(schedule)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Realtime subscriptions
  subscribeToTasks(teamId: string, callback: (payload: any) => void) {
    return supabase
      .channel('care_tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'care_tasks',
          filter: `team_id=eq.${teamId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToMessages(teamId: string, callback: (payload: any) => void) {
    return supabase
      .channel('care_team_messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'care_team_messages',
          filter: `team_id=eq.${teamId}`,
        },
        callback
      )
      .subscribe();
  },
};
