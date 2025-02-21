import { supabase } from '@/lib/supabase';
import { CaregiverProfile } from '@/types/caregiver';

export const caregiverService = {
  async searchCaregivers(params: {
    query?: string;
    location?: string;
    specialties?: string[];
    availability?: string[];
    page?: number;
    limit?: number;
  }): Promise<{ data: CaregiverProfile[]; count: number }> {
    try {
      let query = supabase
        .from('caregiver_profiles')
        .select('*', { count: 'exact' });

      if (params.query) {
        query = query.or(`name.ilike.%${params.query}%, bio.ilike.%${params.query}%`);
      }

      if (params.location) {
        query = query.ilike('location', `%${params.location}%`);
      }

      if (params.specialties?.length) {
        query = query.contains('specialties', params.specialties);
      }

      if (params.availability?.length) {
        query = query.contains('availability', params.availability);
      }

      // Add pagination
      const start = (params.page || 0) * (params.limit || 10);
      query = query.range(start, start + (params.limit || 10) - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data as CaregiverProfile[],
        count: count || 0,
      };
    } catch (error) {
      console.error('Error searching caregivers:', error);
      throw error;
    }
  },

  async getSpecialties(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('specialties')
        .select('name')
        .order('name');

      if (error) throw error;

      return data.map(specialty => specialty.name);
    } catch (error) {
      console.error('Error fetching specialties:', error);
      throw error;
    }
  }
};
