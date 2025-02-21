import { supabase } from '@/lib/supabase/client';
import { careResourcesService } from './care-resources.service';

export interface CareProfile {
  id: string;
  userId: string;
  careType: 'eldercare' | 'childcare' | 'healthcare' | 'disability' | 'mental-health';
  needs: string[];
  preferences: {
    language: string;
    communication: string[];
    schedule: {
      preferredDays: string[];
      preferredTimes: string[];
      timezone: string;
    };
    specialRequirements: string[];
  };
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }[];
  medicalInfo: {
    conditions: string[];
    medications: string[];
    allergies: string[];
    bloodType?: string;
    insuranceInfo?: {
      provider: string;
      policyNumber: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CareMatch {
  id: string;
  caregiverId: string;
  careReceiverId: string;
  matchScore: number;
  matchFactors: {
    factor: string;
    score: number;
  }[];
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: Date;
}

export interface CareSchedule {
  id: string;
  userId: string;
  caregiverId: string;
  type: 'regular' | 'one-time' | 'respite';
  schedule: {
    startDate: Date;
    endDate?: Date;
    recurringDays?: string[];
    times: {
      start: string;
      end: string;
    }[];
  };
  tasks: {
    id: string;
    title: string;
    description?: string;
    duration: number;
    priority: 'low' | 'medium' | 'high';
  }[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface SafetyCheck {
  id: string;
  userId: string;
  type: 'check-in' | 'location' | 'activity' | 'emergency';
  schedule: {
    frequency: 'hourly' | 'daily' | 'weekly';
    times: string[];
    timezone: string;
  };
  contacts: string[];
  lastCheck: Date;
  status: 'active' | 'paused';
}

class CareCompanionService {
  // Care Profile Management
  async createCareProfile(profile: Omit<CareProfile, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('care_profiles')
      .insert({
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCareProfile(id: string, updates: Partial<CareProfile>) {
    const { data, error } = await supabase
      .from('care_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getCareProfile(userId: string) {
    const { data, error } = await supabase
      .from('care_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Care Matching
  async findCareMatches(userId: string, preferences: any) {
    const { data: profile } = await this.getCareProfile(userId);
    if (!profile) throw new Error('Care profile not found');

    const { data: matches, error } = await supabase
      .rpc('find_care_matches', {
        user_id: userId,
        care_type: profile.careType,
        care_needs: profile.needs,
        location: preferences.location,
        schedule: preferences.schedule
      });

    if (error) throw error;
    return matches;
  }

  async acceptCareMatch(matchId: string) {
    const { data, error } = await supabase
      .from('care_matches')
      .update({ status: 'accepted' })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Care Scheduling
  async createCareSchedule(schedule: Omit<CareSchedule, 'id'>) {
    const { data, error } = await supabase
      .from('care_schedules')
      .insert(schedule)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCareSchedule(id: string, updates: Partial<CareSchedule>) {
    const { data, error } = await supabase
      .from('care_schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getCareSchedules(userId: string, filters?: {
    type?: CareSchedule['type'];
    status?: CareSchedule['status'];
    startDate?: Date;
    endDate?: Date;
  }) {
    let query = supabase
      .from('care_schedules')
      .select('*')
      .eq('user_id', userId);

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.startDate) {
      query = query.gte('schedule->startDate', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte('schedule->startDate', filters.endDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Safety Checks
  async createSafetyCheck(check: Omit<SafetyCheck, 'id' | 'lastCheck'>) {
    const { data, error } = await supabase
      .from('safety_checks')
      .insert({
        ...check,
        last_check: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSafetyCheck(id: string, updates: Partial<SafetyCheck>) {
    const { data, error } = await supabase
      .from('safety_checks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async performSafetyCheck(userId: string, checkType: SafetyCheck['type']) {
    const { data: check, error: checkError } = await supabase
      .from('safety_checks')
      .select('*')
      .eq('user_id', userId)
      .eq('type', checkType)
      .single();

    if (checkError) throw checkError;

    if (!check) {
      throw new Error('Safety check not found');
    }

    // Update last check time
    const { error: updateError } = await supabase
      .from('safety_checks')
      .update({
        last_check: new Date().toISOString()
      })
      .eq('id', check.id);

    if (updateError) throw updateError;

    // Create check-in record
    const { data: record, error: recordError } = await supabase
      .from('safety_check_records')
      .insert({
        check_id: check.id,
        user_id: userId,
        type: checkType,
        status: 'completed',
        checked_at: new Date().toISOString()
      })
      .select()
      .single();

    if (recordError) throw recordError;
    return record;
  }

  // Care Insights
  async getCareInsights(userId: string) {
    const [schedules, checkIns, resources] = await Promise.all([
      this.getCareSchedules(userId),
      this.getSafetyCheckHistory(userId),
      careResourcesService.getRecommendedResources(userId)
    ]);

    return {
      schedules: this.analyzeSchedules(schedules),
      safety: this.analyzeSafetyChecks(checkIns),
      recommendations: resources
    };
  }

  private analyzeSchedules(schedules: CareSchedule[]) {
    return {
      total: schedules.length,
      completed: schedules.filter(s => s.status === 'completed').length,
      upcoming: schedules.filter(s => s.status === 'scheduled').length,
      cancelledRate: schedules.length > 0 
        ? schedules.filter(s => s.status === 'cancelled').length / schedules.length 
        : 0,
      mostCommonTasks: this.getMostCommonTasks(schedules)
    };
  }

  private analyzeSafetyChecks(checks: any[]) {
    return {
      total: checks.length,
      completedOnTime: checks.filter(c => c.status === 'completed').length,
      missedRate: checks.length > 0
        ? checks.filter(c => c.status === 'missed').length / checks.length
        : 0,
      lastCheck: checks[0]?.checked_at
    };
  }

  private getMostCommonTasks(schedules: CareSchedule[]) {
    const taskCounts = schedules.flatMap(s => s.tasks)
      .reduce((acc, task) => {
        acc[task.title] = (acc[task.title] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(taskCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([title, count]) => ({ title, count }));
  }

  private async getSafetyCheckHistory(userId: string) {
    const { data, error } = await supabase
      .from('safety_check_records')
      .select('*')
      .eq('user_id', userId)
      .order('checked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export const careCompanionService = new CareCompanionService();
