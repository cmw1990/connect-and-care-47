
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          role: string | null;
          avatar_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      caregiver_profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          bio: string | null;
          specialties: string[] | null;
          certifications: string[] | null;
          experience_years: number | null;
          hourly_rate: number;
          availability: string[] | null;
          location: string | null;
          latitude: number | null;
          longitude: number | null;
          verified: boolean | null;
          rating: number | null;
          reviews_count: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          bio?: string | null;
          specialties?: string[] | null;
          certifications?: string[] | null;
          experience_years?: number | null;
          hourly_rate: number;
          availability?: string[] | null;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          verified?: boolean | null;
          rating?: number | null;
          reviews_count?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          bio?: string | null;
          specialties?: string[] | null;
          certifications?: string[] | null;
          experience_years?: number | null;
          hourly_rate?: number;
          availability?: string[] | null;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          verified?: boolean | null;
          rating?: number | null;
          reviews_count?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      patient_info: {
        Row: {
          id: string;
          user_id: string;
          medical_conditions: string[] | null;
          allergies: string[] | null;
          medications: string[] | null;
          emergency_contacts: Record<string, any> | null;
          care_preferences: Record<string, any> | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          medical_conditions?: string[] | null;
          allergies?: string[] | null;
          medications?: string[] | null;
          emergency_contacts?: Record<string, any> | null;
          care_preferences?: Record<string, any> | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          medical_conditions?: string[] | null;
          allergies?: string[] | null;
          medications?: string[] | null;
          emergency_contacts?: Record<string, any> | null;
          care_preferences?: Record<string, any> | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      care_tasks: {
        Row: {
          id: string;
          team_id: string;
          title: string;
          description: string | null;
          category: string;
          priority: string;
          status: string | null;
          assigned_to: string | null;
          due_date: string | null;
          completion_notes: string | null;
          completed_at: string | null;
          completed_by: string | null;
          recurring: boolean | null;
          recurrence_pattern: Record<string, any> | null;
          created_by: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          team_id: string;
          title: string;
          description?: string | null;
          category: string;
          priority: string;
          status?: string | null;
          assigned_to?: string | null;
          due_date?: string | null;
          completion_notes?: string | null;
          completed_at?: string | null;
          completed_by?: string | null;
          recurring?: boolean | null;
          recurrence_pattern?: Record<string, any> | null;
          created_by: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          team_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          priority?: string;
          status?: string | null;
          assigned_to?: string | null;
          due_date?: string | null;
          completion_notes?: string | null;
          completed_at?: string | null;
          completed_by?: string | null;
          recurring?: boolean | null;
          recurrence_pattern?: Record<string, any> | null;
          created_by?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      // Add definitions for other tables as needed
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
