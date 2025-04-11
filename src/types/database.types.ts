
export interface Json {
  [key: string]: any
}

export interface Database {
  public: {
    Tables: {
      affiliate_interactions: {
        Row: {
          user_id: string
          created_at: string | null
          affiliate_link: string | null
          interaction_type: string
          product_id: string
          id: string
        }
        Insert: {
          user_id: string
          created_at?: string | null
          affiliate_link?: string | null
          interaction_type: string
          product_id: string
          id?: string
        }
        Update: {
          user_id?: string
          created_at?: string | null
          affiliate_link?: string | null
          interaction_type?: string
          product_id?: string
          id?: string
        }
        Relationships: []
      }
      availability_slots: any
      background_checks: any
      care_analytics: any
      care_circle_invites: any
      care_connections: any
      care_facilities: any
      care_groups: any
      care_group_members: any
      care_notes: any
      care_outcome_metrics: {
        Row: {
          id: string
          metric_type: string
          value: number
          user_id: string
          recorded_at: string
          created_at: string
          updated_at: string
          companion_meeting_id?: string
        }
        Insert: {
          id?: string
          metric_type: string
          value: number
          user_id: string
          recorded_at?: string
          created_at?: string
          updated_at?: string
          companion_meeting_id?: string
        }
        Update: {
          id?: string
          metric_type?: string
          value?: number
          user_id?: string
          recorded_at?: string
          created_at?: string
          updated_at?: string
          companion_meeting_id?: string
        }
        Relationships: []
      }
      care_products: any
      care_quality_metrics: any
      care_recipients: {
        Row: {
          id: string
          group_id: string
          first_name: string
          last_name: string
          date_of_birth: string | null
          gender: string | null
          care_needs: Json
          medical_history: Json
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          first_name: string
          last_name: string
          date_of_birth?: string | null
          gender?: string | null
          care_needs?: Json
          medical_history?: Json
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string | null
          gender?: string | null
          care_needs?: Json
          medical_history?: Json
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      care_routines: any
      care_tasks: any
      care_team_availability: any
      care_team_members: any
      care_teams: any
      care_updates: {
        Row: {
          id: string
          group_id: string
          content: string
          update_type: string
          author_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          content: string
          update_type: string
          author_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          content?: string
          update_type?: string
          author_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_updates_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      caregiver_availability: any
      caregiver_bookings: any
      caregiver_profiles: any
      companion_activity_templates: any
      companion_profiles: any
      danger_zone_types: any
      dementia_profiles: any
      facility_leads: any
      geofences: {
        Row: {
          id: string
          name: string
          type: string
          center_lat: number
          center_lng: number
          radius: number
          group_id: string
          created_at: string
          updated_at: string
          boundary_type?: string
          polygon_coordinates?: Json
          danger_zones?: Json[]
          notification_settings?: Json
        }
        Insert: {
          id?: string
          name: string
          type: string
          center_lat: number
          center_lng: number
          radius: number
          group_id: string
          created_at?: string
          updated_at?: string
          boundary_type?: string
          polygon_coordinates?: Json
          danger_zones?: Json[]
          notification_settings?: Json
        }
        Update: {
          id?: string
          name?: string
          type?: string
          center_lat?: number
          center_lng?: number
          radius?: number
          group_id?: string
          created_at?: string
          updated_at?: string
          boundary_type?: string
          polygon_coordinates?: Json
          danger_zones?: Json[]
          notification_settings?: Json
        }
        Relationships: []
      }
      geofence_alerts: any
      group_posts: {
        Row: {
          id: string
          content: string
          created_at: string
          updated_at: string
          created_by: string
          group_id: string
        }
        Insert: {
          id?: string
          content: string
          created_at?: string
          updated_at?: string
          created_by?: string
          group_id: string
        }
        Update: {
          id?: string
          content?: string
          created_at?: string
          updated_at?: string
          created_by?: string
          group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_posts_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      insurance_analytics: any
      insurance_claims: any
      insurance_deductibles: any
      insurance_documents: any
      insurance_network_providers: any
      insurance_notifications: any
      insurance_plan_benefits: any
      insurance_plans: any
      insurance_preauthorizations: any
      insurance_verification_history: any
      medical_device_data: any
      medical_documents: any
      medication_adherence_trends: any
      medication_inventory: any
      medication_logs: any
      medication_portal_settings: any
      medication_schedules: {
        Row: {
          id: string
          group_id: string
          medication_name: string
          dosage: string
          frequency: string
          time_of_day: string[]
          created_at: string
          updated_at: string
          instructions?: string
          start_date?: string
          end_date?: string
        }
        Insert: {
          id?: string
          group_id: string
          medication_name: string
          dosage: string
          frequency: string
          time_of_day: string[]
          created_at?: string
          updated_at?: string
          instructions?: string
          start_date?: string
          end_date?: string
        }
        Update: {
          id?: string
          group_id?: string
          medication_name?: string
          dosage?: string
          frequency?: string
          time_of_day?: string[]
          created_at?: string
          updated_at?: string
          instructions?: string
          start_date?: string
          end_date?: string
        }
        Relationships: []
      }
      medication_supervision_summary: any
      medication_verification_settings: any
      medication_verifications: any
      patient_check_ins: any
      patient_info: any
      patient_locations: {
        Row: {
          id: string
          group_id: string
          location_enabled: boolean
          current_location: Json
          created_at: string
          updated_at: string
          location_history?: Json[]
        }
        Insert: {
          id?: string
          group_id: string
          location_enabled?: boolean
          current_location?: Json
          created_at?: string
          updated_at?: string
          location_history?: Json[]
        }
        Update: {
          id?: string
          group_id?: string
          location_enabled?: boolean
          current_location?: Json
          created_at?: string
          updated_at?: string
          location_history?: Json[]
        }
        Relationships: []
      }
      private_messages: any
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          role: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          role?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          role?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      resource_library: any
      subscription_plans: any
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          priority: string
          assigned_to: string
          due_date: string | null
          group_id: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status: string
          priority: string
          assigned_to: string
          due_date?: string | null
          group_id: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          assigned_to?: string
          due_date?: string | null
          group_id?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      team_messages: any
      temp_services: any
      user_insurance: any
      verification_requests: any
      video_consultations: any
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

// For use with the Supabase client
export type ExtendedDatabase = Database & {
  public: {
    Tables: {
      // Add any missing tables that are used in components
      care_circle_invites: {
        Row: {
          id: string
          group_id: string
          email: string
          role: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          email: string
          role: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          email?: string
          role?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      },
      // Add extended geofence types with additional fields
      geofences: {
        Row: {
          id: string
          name: string
          type: string
          center_lat: number
          center_lng: number
          radius: number
          group_id: string
          created_at: string
          updated_at: string
          boundary_type: string
          polygon_coordinates: Json
          danger_zones: Json[]
          notification_settings: Json
          active: boolean
        }
        Insert: {
          id?: string
          name: string
          type: string
          center_lat: number
          center_lng: number
          radius: number
          group_id: string
          created_at?: string
          updated_at?: string
          boundary_type?: string
          polygon_coordinates?: Json
          danger_zones?: Json[]
          notification_settings?: Json
          active?: boolean
        }
        Update: {
          id?: string
          name?: string
          type?: string
          center_lat?: number
          center_lng?: number
          radius?: number
          group_id?: string
          created_at?: string
          updated_at?: string
          boundary_type?: string
          polygon_coordinates?: Json
          danger_zones?: Json[]
          notification_settings?: Json
          active?: boolean
        }
        Relationships: []
      }
    }
  }
}

// Define common interfaces used in components
export interface CareRecipient {
  id: string;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  care_needs: string[];
  special_requirements: string[];
  medical_conditions: string[];
  allergies: string[];
  preferences: Record<string, any>;
  group_id: string;
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
  assigned_user?: {
    first_name: string;
    last_name: string;
  };
}

export interface Post {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
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

export interface InsuranceNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  metadata: Record<string, any>;
  created_at: string;
  user_id: string;
}

export interface MedicationSchedule {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  time_of_day: string[];
  instructions: string;
  start_date: string;
  end_date: string;
  group_id: string;
  created_at: string;
  updated_at: string;
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

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  content_type: string;
  file_url: string;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  tier: string;
  price: number;
  features: string[];
  is_popular: boolean;
}

export interface MedicationLog {
  id: string;
  schedule_id: string;
  taken_at: string;
  administered_at?: string;
  status: 'taken' | 'missed' | 'pending_verification' | 'verified';
  notes?: string;
  photo_verification_url?: string;
  medication_schedule?: MedicationSchedule;
  group_id: string;
}

export interface VitalData {
  id: string;
  device_type: string;
  readings: {
    blood_pressure?: {
      systolic: number;
      diastolic: number;
    };
    heart_rate?: number;
    temperature?: number;
  };
  recorded_at: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationSettings {
  id: string;
  group_id: string;
  require_photo: boolean;
  supervision_level: 'low' | 'medium' | 'high';
  auto_approve_after_minutes?: number;
  notify_missed_medications: boolean;
  supervisors: string[];
  created_at: string;
  updated_at: string;
}

export type SelectQueryError<T> = {
  error: true;
} & String;
