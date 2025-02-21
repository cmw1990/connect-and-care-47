import { supabase } from '@/lib/supabase/client';
import { Tables } from '@/types/database.types';
import { analyticsService } from './analytics.service';
import { notificationService } from './notification.service';

export interface SupportRequest {
  id: string;
  userId: string;
  type: 'respite' | 'transportation' | 'meals' | 'housekeeping' | 'emotional' | 'medical' | 'other';
  status: 'pending' | 'matched' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  urgency: 'low' | 'medium' | 'high';
  scheduledDate?: string;
  location?: {
    address: string;
    coordinates?: [number, number];
  };
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface SupportProvider {
  id: string;
  userId: string;
  services: SupportRequest['type'][];
  availability: {
    schedule: {
      day: string;
      startTime: string;
      endTime: string;
    }[];
    locations: string[];
  };
  qualifications?: string[];
  verifications?: {
    type: string;
    status: 'pending' | 'verified' | 'rejected';
    date: string;
  }[];
  rating?: number;
  active: boolean;
}

export interface SupportGroup {
  id: string;
  name: string;
  description: string;
  type: 'general' | 'condition_specific' | 'caregiver' | 'bereavement';
  format: 'online' | 'in_person' | 'hybrid';
  schedule: {
    frequency: string;
    dayOfWeek?: string;
    time?: string;
    timezone?: string;
  };
  location?: {
    address: string;
    coordinates?: [number, number];
  };
  facilitator?: {
    userId: string;
    name: string;
    qualifications?: string[];
  };
  capacity?: number;
  private: boolean;
  tags: string[];
}

class SupportService {
  async createSupportRequest(request: Omit<SupportRequest, 'id'>): Promise<SupportRequest> {
    const { data, error } = await supabase
      .from('support_requests')
      .insert({
        user_id: request.userId,
        type: request.type,
        status: request.status,
        description: request.description,
        urgency: request.urgency,
        scheduled_date: request.scheduledDate,
        location: request.location,
        preferences: request.preferences,
        metadata: request.metadata,
      })
      .select()
      .single();

    if (error) throw error;

    // Find matching providers
    await this.findMatchingProviders(data);

    analyticsService.trackEvent({
      category: 'support',
      action: 'create_request',
      label: request.type,
      metadata: { userId: request.userId, urgency: request.urgency },
    });

    return data;
  }

  private async findMatchingProviders(request: SupportRequest): Promise<void> {
    const { data: providers } = await supabase
      .from('support_providers')
      .select('*')
      .contains('services', [request.type])
      .eq('active', true);

    if (!providers?.length) return;

    // Filter by availability and location if applicable
    const matchingProviders = providers.filter(provider => {
      if (request.scheduledDate) {
        // Check provider availability
        const requestDate = new Date(request.scheduledDate);
        const dayOfWeek = requestDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        const available = provider.availability.schedule.some(schedule => {
          return schedule.day.toLowerCase() === dayOfWeek &&
                 this.isTimeWithinRange(
                   requestDate.toTimeString().slice(0, 5),
                   schedule.startTime,
                   schedule.endTime
                 );
        });

        if (!available) return false;
      }

      if (request.location && provider.availability.locations) {
        // Check if provider serves the location
        const matchesLocation = provider.availability.locations.some(loc =>
          request.location?.address.toLowerCase().includes(loc.toLowerCase())
        );
        if (!matchesLocation) return false;
      }

      return true;
    });

    // Notify matching providers
    for (const provider of matchingProviders) {
      await notificationService.create({
        userId: provider.userId,
        type: 'support_request',
        title: 'New Support Request',
        message: `New ${request.type} support request matching your profile`,
        priority: request.urgency,
        data: { requestId: request.id },
      });
    }
  }

  private isTimeWithinRange(time: string, start: string, end: string): boolean {
    return time >= start && time <= end;
  }

  async getSupportRequests(params: {
    userId?: string;
    type?: SupportRequest['type'];
    status?: SupportRequest['status'];
    startDate?: string;
    endDate?: string;
  }): Promise<SupportRequest[]> {
    let query = supabase
      .from('support_requests')
      .select('*');

    if (params.userId) {
      query = query.eq('user_id', params.userId);
    }

    if (params.type) {
      query = query.eq('type', params.type);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.startDate) {
      query = query.gte('scheduled_date', params.startDate);
    }

    if (params.endDate) {
      query = query.lte('scheduled_date', params.endDate);
    }

    const { data, error } = await query.order('scheduled_date', { ascending: true });

    if (error) throw error;
    return data;
  }

  async updateRequestStatus(requestId: string, status: SupportRequest['status'], providerId?: string): Promise<void> {
    const { data: request, error: requestError } = await supabase
      .from('support_requests')
      .update({
        status,
        provider_id: providerId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (requestError) throw requestError;

    // Notify the requester
    await notificationService.create({
      userId: request.user_id,
      type: 'support_update',
      title: 'Support Request Update',
      message: `Your support request status has been updated to ${status}`,
      data: { requestId },
    });

    analyticsService.trackEvent({
      category: 'support',
      action: 'update_request_status',
      label: status,
      metadata: { requestId, providerId },
    });
  }

  async registerProvider(provider: Omit<SupportProvider, 'id' | 'rating'>): Promise<SupportProvider> {
    const { data, error } = await supabase
      .from('support_providers')
      .insert({
        user_id: provider.userId,
        services: provider.services,
        availability: provider.availability,
        qualifications: provider.qualifications,
        verifications: provider.verifications,
        active: provider.active,
      })
      .select()
      .single();

    if (error) throw error;

    analyticsService.trackEvent({
      category: 'support',
      action: 'register_provider',
      label: provider.services.join(','),
      metadata: { userId: provider.userId },
    });

    return data;
  }

  async updateProviderAvailability(providerId: string, availability: SupportProvider['availability']): Promise<void> {
    const { error } = await supabase
      .from('support_providers')
      .update({
        availability,
        updated_at: new Date().toISOString(),
      })
      .eq('id', providerId);

    if (error) throw error;
  }

  async getProviders(params: {
    services?: SupportRequest['type'][];
    location?: string;
    active?: boolean;
  }): Promise<SupportProvider[]> {
    let query = supabase
      .from('support_providers')
      .select('*');

    if (params.services?.length) {
      query = query.contains('services', params.services);
    }

    if (params.active !== undefined) {
      query = query.eq('active', params.active);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Filter by location if specified
    if (params.location && data.length) {
      return data.filter(provider =>
        provider.availability.locations.some(loc =>
          loc.toLowerCase().includes(params.location!.toLowerCase())
        )
      );
    }

    return data;
  }

  async createSupportGroup(group: Omit<SupportGroup, 'id'>): Promise<SupportGroup> {
    const { data, error } = await supabase
      .from('support_groups')
      .insert({
        name: group.name,
        description: group.description,
        type: group.type,
        format: group.format,
        schedule: group.schedule,
        location: group.location,
        facilitator: group.facilitator,
        capacity: group.capacity,
        private: group.private,
        tags: group.tags,
      })
      .select()
      .single();

    if (error) throw error;

    analyticsService.trackEvent({
      category: 'support',
      action: 'create_group',
      label: group.type,
    });

    return data;
  }

  async getSupportGroups(params: {
    type?: SupportGroup['type'];
    format?: SupportGroup['format'];
    tags?: string[];
    search?: string;
  }): Promise<SupportGroup[]> {
    let query = supabase
      .from('support_groups')
      .select('*');

    if (params.type) {
      query = query.eq('type', params.type);
    }

    if (params.format) {
      query = query.eq('format', params.format);
    }

    if (params.tags?.length) {
      query = query.contains('tags', params.tags);
    }

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  async joinSupportGroup(groupId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        joined_at: new Date().toISOString(),
      });

    if (error) throw error;

    analyticsService.trackEvent({
      category: 'support',
      action: 'join_group',
      label: groupId,
      metadata: { userId },
    });
  }

  async leaveSupportGroup(groupId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;

    analyticsService.trackEvent({
      category: 'support',
      action: 'leave_group',
      label: groupId,
      metadata: { userId },
    });
  }

  async getGroupMembers(groupId: string): Promise<{
    userId: string;
    joinedAt: string;
  }[]> {
    const { data, error } = await supabase
      .from('group_members')
      .select('user_id, joined_at')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data;
  }
}

export const supportService = new SupportService();
