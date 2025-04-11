
/**
 * This file extends the Supabase types with our custom tables
 * since we can't directly modify the generated types.ts file
 */
import { Database as GeneratedDatabase } from "@/integrations/supabase/types";

export interface ExtendedDatabase extends GeneratedDatabase {
  public: {
    Tables: GeneratedDatabase["public"]["Tables"] & {
      care_outcome_metrics: {
        Row: {
          id: string;
          metric_type: string;
          value: number;
          user_id: string;
          recorded_at: string;
          created_at: string;
          updated_at: string;
          companion_meeting_id?: string;
        };
        Insert: {
          id?: string;
          metric_type: string;
          value: number;
          user_id: string;
          recorded_at?: string;
          created_at?: string;
          updated_at?: string;
          companion_meeting_id?: string;
        };
        Update: {
          id?: string;
          metric_type?: string;
          value?: number;
          user_id?: string;
          recorded_at?: string;
          created_at?: string;
          updated_at?: string;
          companion_meeting_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "care_outcome_metrics_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      verification_requests: {
        Row: {
          id: string;
          user_id: string;
          request_type: string;
          documents: any[];
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          request_type: string;
          documents?: any[];
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          request_type?: string;
          documents?: any[];
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "verification_requests_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      background_checks: {
        Row: {
          id: string;
          user_id: string;
          check_type: string;
          status: string;
          results: any;
          provider: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          check_type: string;
          status?: string;
          results?: any;
          provider?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          check_type?: string;
          status?: string;
          results?: any;
          provider?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "background_checks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      affiliate_interactions: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          interaction_type: string;
          affiliate_link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          interaction_type: string;
          affiliate_link?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string;
          interaction_type?: string;
          affiliate_link?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "affiliate_interactions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      medical_documents: {
        Row: {
          id: string;
          group_id: string;
          title: string;
          description: string | null;
          document_type: string | null;
          file_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          title: string;
          description?: string | null;
          document_type?: string | null;
          file_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          title?: string;
          description?: string | null;
          document_type?: string | null;
          file_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "medical_documents_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      care_circle_invites: {
        Row: {
          id: string;
          group_id: string;
          email: string;
          role: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          email: string;
          role: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          email?: string;
          role?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      care_recipients: {
        Row: {
          id: string;
          group_id: string;
          first_name: string;
          last_name: string;
          date_of_birth: string | null;
          gender: string | null;
          care_needs: any;
          medical_history: any;
          preferences: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          first_name: string;
          last_name: string;
          date_of_birth?: string | null;
          gender?: string | null;
          care_needs?: any;
          medical_history?: any;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          first_name?: string;
          last_name?: string;
          date_of_birth?: string | null;
          gender?: string | null;
          care_needs?: any;
          medical_history?: any;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      medical_device_data: {
        Row: {
          id: string;
          user_id: string;
          device_type: string;
          readings: any;
          recorded_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_type: string;
          readings: any;
          recorded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_type?: string;
          readings?: any;
          recorded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "medical_device_data_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      care_groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          privacy_settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          privacy_settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          privacy_settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      geofences: {
        Row: {
          id: string;
          group_id: string;
          name: string;
          center_lat: number;
          center_lng: number;
          radius: number;
          type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          name: string;
          center_lat: number;
          center_lng: number;
          radius: number;
          type: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          name?: string;
          center_lat?: number;
          center_lng?: number;
          radius?: number;
          type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      danger_zone_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      care_group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          member_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          member_type: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          member_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "care_group_members_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      group_posts: {
        Row: {
          id: string;
          group_id: string;
          content: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          content: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          content?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_posts_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          due_date: string | null;
          assigned_to: string | null;
          group_id: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          assigned_to?: string | null;
          group_id: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          assigned_to?: string | null;
          group_id?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey";
            columns: ["assigned_to"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      care_connections: {
        Row: {
          id: string;
          requester_id: string;
          recipient_id: string;
          connection_type: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          recipient_id: string;
          connection_type: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          recipient_id?: string;
          connection_type?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "care_connections_requester_id_fkey";
            columns: ["requester_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "care_connections_recipient_id_fkey";
            columns: ["recipient_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      // Add insurance related tables
      insurance_claims: {
        Row: {
          id: string;
          user_id: string;
          insurance_id: string;
          service_type: string;
          service_date: string;
          claim_amount: number;
          status: string;
          processing_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          insurance_id: string;
          service_type: string;
          service_date: string;
          claim_amount: number;
          status?: string;
          processing_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          insurance_id?: string;
          service_type?: string;
          service_date?: string;
          claim_amount?: number;
          status?: string;
          processing_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "insurance_claims_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      insurance_plans: {
        Row: {
          id: string;
          name: string;
          provider: string;
          type: string;
          coverage_details: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          provider: string;
          type: string;
          coverage_details: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          provider?: string;
          type?: string;
          coverage_details?: any;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_insurance: {
        Row: {
          id: string;
          user_id: string;
          insurance_plan_id: string;
          policy_number: string;
          group_number: string | null;
          coverage_start_date: string;
          coverage_end_date: string | null;
          verification_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          insurance_plan_id: string;
          policy_number: string;
          group_number?: string | null;
          coverage_start_date: string;
          coverage_end_date?: string | null;
          verification_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          insurance_plan_id?: string;
          policy_number?: string;
          group_number?: string | null;
          coverage_start_date?: string;
          coverage_end_date?: string | null;
          verification_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_insurance_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      insurance_documents: {
        Row: {
          id: string;
          user_id: string;
          insurance_id: string;
          document_type: string;
          file_url: string;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          insurance_id: string;
          document_type: string;
          file_url: string;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          insurance_id?: string;
          document_type?: string;
          file_url?: string;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "insurance_documents_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      insurance_deductibles: {
        Row: {
          id: string;
          user_id: string;
          insurance_id: string;
          type: string;
          amount: number;
          remaining: number;
          year: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          insurance_id: string;
          type: string;
          amount: number;
          remaining: number;
          year: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          insurance_id?: string;
          type?: string;
          amount?: number;
          remaining?: number;
          year?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "insurance_deductibles_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      insurance_notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          message: string;
          read: boolean;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          message: string;
          read?: boolean;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          message?: string;
          read?: boolean;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "insurance_notifications_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: GeneratedDatabase["public"]["Views"];
    Functions: GeneratedDatabase["public"]["Functions"];
    Enums: GeneratedDatabase["public"]["Enums"];
    CompositeTypes: GeneratedDatabase["public"]["CompositeTypes"];
  };
}
