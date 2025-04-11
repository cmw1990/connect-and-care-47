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

export interface DayContentProps {
  date: Date;
  // Add other properties as needed
}

export interface CompanionMatch {
  id: string;
  user: { first_name: string; last_name: string };
  expertise_areas: string[];
  dementia_experience: boolean;
  communication_preferences: string[];
  languages: string[];
  virtual_meeting_preference: boolean;
  in_person_meeting_preference: boolean;
  rating: number;
  hourly_rate: number;
  identity_verified: boolean;
  mental_health_specialties: string[];
  support_tools_proficiency: any;
  virtual_meeting_tools: string[];
  interests: string[];
  cognitive_engagement_activities: {
    memory_games: string[];
    brain_teasers: string[];
    social_activities: string[];
    creative_exercises: string[];
  };
}

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  connection_type: 'carer' | 'pal';
  status: string;
  created_at: string;
  updated_at: string;
  requester: {
    first_name: string;
    last_name: string;
  };
  recipient: {
    first_name: string;
    last_name: string;
  };
}

export interface CareUpdate {
  id: string;
  content: string;
  update_type: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

export interface Task {
  id: string;
  title: string;
  due_date: string;
  status: string;
  priority: string;
  assigned_to: string;
}

export interface Post {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
}

export interface CareRecipient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  care_needs: string[];
  medical_conditions: string[];
  allergies: string[];
  medications: string[];
  preferences: Record<string, any>;
}

export interface Document {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  document_type: string | null;
  created_by: string | null;
  created_at: string;
}

export interface InsuranceBenefitRow {
  id: string;
  benefit_name: string;
  // Add other fields as needed
}

export interface InsuranceDeductible {
  id: string;
  insurance_id: string;
  type: string;
  amount: number;
  remaining: number;
  year: number;
  updated_at: string;
}

export interface InsuranceDocument {
  id: string;
  user_id: string;
  insurance_id: string;
  file_url: string;
  document_type: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface InsuranceDocumentResponse extends InsuranceDocument {
  // Any additional fields needed for responses
}
