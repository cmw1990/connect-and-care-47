import { supabase } from '@/lib/supabase/client';

export interface CareGuide {
  id: string;
  title: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  resources: string[];
  tags: string[];
  estimatedTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CareResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'checklist' | 'template' | 'tool';
  category: string;
  content: string;
  url?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LegalResource {
  id: string;
  title: string;
  category: string;
  jurisdiction: string;
  content: string;
  lastUpdated: Date;
  citations: string[];
  tags: string[];
}

export interface CommunityResource {
  id: string;
  name: string;
  type: 'support_group' | 'organization' | 'program' | 'event';
  description: string;
  location: string;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  schedule?: {
    days: string[];
    times: string[];
    timezone: string;
  };
  tags: string[];
}

class CareResourcesService {
  // Care Guides
  async createGuide(guide: Omit<CareGuide, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('care_guides')
      .insert({
        ...guide,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getGuides(filters?: {
    category?: string;
    difficulty?: CareGuide['difficulty'];
    tags?: string[];
  }) {
    let query = supabase.from('care_guides').select('*');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters?.tags?.length) {
      query = query.contains('tags', filters.tags);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Care Resources
  async createResource(resource: Omit<CareResource, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('care_resources')
      .insert({
        ...resource,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getResources(filters?: {
    type?: CareResource['type'];
    category?: string;
    tags?: string[];
  }) {
    let query = supabase.from('care_resources').select('*');

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.tags?.length) {
      query = query.contains('tags', filters.tags);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Legal Resources
  async getLegalResources(filters?: {
    category?: string;
    jurisdiction?: string;
    tags?: string[];
  }) {
    let query = supabase.from('legal_resources').select('*');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.jurisdiction) {
      query = query.eq('jurisdiction', filters.jurisdiction);
    }
    if (filters?.tags?.length) {
      query = query.contains('tags', filters.tags);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Community Resources
  async getCommunityResources(filters?: {
    type?: CommunityResource['type'];
    location?: string;
    tags?: string[];
  }) {
    let query = supabase.from('community_resources').select('*');

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters?.tags?.length) {
      query = query.contains('tags', filters.tags);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Search across all resources
  async searchResources(query: string) {
    const { data: guides, error: guidesError } = await supabase
      .from('care_guides')
      .select('*')
      .or(`title.ilike.%${query}%, content.ilike.%${query}%`);

    const { data: resources, error: resourcesError } = await supabase
      .from('care_resources')
      .select('*')
      .or(`title.ilike.%${query}%, content.ilike.%${query}%`);

    const { data: legal, error: legalError } = await supabase
      .from('legal_resources')
      .select('*')
      .or(`title.ilike.%${query}%, content.ilike.%${query}%`);

    const { data: community, error: communityError } = await supabase
      .from('community_resources')
      .select('*')
      .or(`name.ilike.%${query}%, description.ilike.%${query}%`);

    if (guidesError || resourcesError || legalError || communityError) {
      throw new Error('Error searching resources');
    }

    return {
      guides: guides || [],
      resources: resources || [],
      legal: legal || [],
      community: community || []
    };
  }

  // Resource Recommendations
  async getRecommendedResources(userId: string) {
    // Get user's care profile and preferences
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('care_needs, interests, location')
      .eq('user_id', userId)
      .single();

    if (!profile) return [];

    // Get resources matching user's needs and interests
    const { data: recommendations } = await supabase
      .rpc('get_resource_recommendations', {
        user_care_needs: profile.care_needs,
        user_interests: profile.interests,
        user_location: profile.location
      });

    return recommendations;
  }

  // Resource Collections
  async createCollection(userId: string, name: string, resourceIds: string[]) {
    const { data, error } = await supabase
      .from('resource_collections')
      .insert({
        user_id: userId,
        name,
        resource_ids: resourceIds,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserCollections(userId: string) {
    const { data, error } = await supabase
      .from('resource_collections')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  // Resource Progress Tracking
  async trackResourceProgress(userId: string, resourceId: string, progress: number) {
    const { data, error } = await supabase
      .from('resource_progress')
      .upsert({
        user_id: userId,
        resource_id: resourceId,
        progress,
        last_accessed: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getResourceProgress(userId: string, resourceId: string) {
    const { data, error } = await supabase
      .from('resource_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('resource_id', resourceId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}

export const careResourcesService = new CareResourcesService();
