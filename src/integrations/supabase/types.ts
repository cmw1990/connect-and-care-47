export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      care_analytics: {
        Row: {
          created_by: string | null
          group_id: string | null
          id: string
          metric_type: string
          metric_value: Json
          recorded_at: string
        }
        Insert: {
          created_by?: string | null
          group_id?: string | null
          id?: string
          metric_type: string
          metric_value: Json
          recorded_at?: string
        }
        Update: {
          created_by?: string | null
          group_id?: string | null
          id?: string
          metric_type?: string
          metric_value?: Json
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_analytics_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_analytics_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      care_assignments: {
        Row: {
          assignment_type: Database["public"]["Enums"]["user_type"]
          caregiver_id: string
          created_at: string | null
          end_date: string | null
          group_id: string
          id: string
          notes: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assignment_type: Database["public"]["Enums"]["user_type"]
          caregiver_id: string
          created_at?: string | null
          end_date?: string | null
          group_id: string
          id?: string
          notes?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assignment_type?: Database["public"]["Enums"]["user_type"]
          caregiver_id?: string
          created_at?: string | null
          end_date?: string | null
          group_id?: string
          id?: string
          notes?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_assignments_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_assignments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      care_facilities: {
        Row: {
          address: string | null
          cost_range: Json | null
          created_at: string
          description: string | null
          id: string
          listing_expires_at: string | null
          listing_type: string | null
          location: Json | null
          name: string
          ratings: Json | null
          services: Json | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          cost_range?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          listing_expires_at?: string | null
          listing_type?: string | null
          location?: Json | null
          name: string
          ratings?: Json | null
          services?: Json | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          cost_range?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          listing_expires_at?: string | null
          listing_type?: string | null
          location?: Json | null
          name?: string
          ratings?: Json | null
          services?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      care_group_members: {
        Row: {
          created_at: string
          group_id: string | null
          id: string
          member_type: Database["public"]["Enums"]["user_type"] | null
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          group_id?: string | null
          id?: string
          member_type?: Database["public"]["Enums"]["user_type"] | null
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          group_id?: string | null
          id?: string
          member_type?: Database["public"]["Enums"]["user_type"] | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      care_groups: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          privacy_settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          privacy_settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          privacy_settings?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      care_guide_videos: {
        Row: {
          created_at: string
          description: string | null
          disease: string
          id: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          disease: string
          id?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          disease?: string
          id?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      care_products: {
        Row: {
          affiliate_link: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          price: number | null
          price_range: Json | null
          ratings: Json | null
          specifications: Json | null
          updated_at: string
        }
        Insert: {
          affiliate_link?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price?: number | null
          price_range?: Json | null
          ratings?: Json | null
          specifications?: Json | null
          updated_at?: string
        }
        Update: {
          affiliate_link?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number | null
          price_range?: Json | null
          ratings?: Json | null
          specifications?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      care_schedule: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string
          group_id: string | null
          id: string
          recurrence: Json | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time: string
          group_id?: string | null
          id?: string
          recurrence?: Json | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string
          group_id?: string | null
          id?: string
          recurrence?: Json | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_schedule_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_schedule_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      caregiver_journals: {
        Row: {
          content: string
          created_at: string
          id: string
          mood: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mood?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mood?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      caregiver_wellness_logs: {
        Row: {
          created_at: string
          exercise_minutes: number | null
          id: string
          mood: string | null
          notes: string | null
          sleep_hours: number | null
          stress_level: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          exercise_minutes?: number | null
          id?: string
          mood?: string | null
          notes?: string | null
          sleep_hours?: number | null
          stress_level?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          exercise_minutes?: number | null
          id?: string
          mood?: string | null
          notes?: string | null
          sleep_hours?: number | null
          stress_level?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_wellness_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string
          id: string
          likes: number | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          created_at?: string
          id?: string
          likes?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          likes?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          group_id: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          priority: number | null
          relationship: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          group_id?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          priority?: number | null
          relationship?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          group_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          priority?: number | null
          relationship?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      entertainment_activities: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          group_id: string | null
          id: string
          participants: Json | null
          schedule: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          participants?: Json | null
          schedule?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          participants?: Json | null
          schedule?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entertainment_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entertainment_activities_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_posts: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          group_id: string | null
          id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          group_id?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          group_id?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          category: string | null
          content: string
          created_at: string
          created_by: string | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_documents: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          document_type: string | null
          file_url: string | null
          group_id: string | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_type?: string | null
          file_url?: string | null
          group_id?: string | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_type?: string | null
          file_url?: string | null
          group_id?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_documents_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_info: {
        Row: {
          basic_info: Json | null
          care_tips: string[] | null
          created_at: string
          diseases: string[] | null
          facility_id: string | null
          group_id: string | null
          id: string
          medicines: Json | null
          primary_caregiver_id: string | null
          updated_at: string
        }
        Insert: {
          basic_info?: Json | null
          care_tips?: string[] | null
          created_at?: string
          diseases?: string[] | null
          facility_id?: string | null
          group_id?: string | null
          id?: string
          medicines?: Json | null
          primary_caregiver_id?: string | null
          updated_at?: string
        }
        Update: {
          basic_info?: Json | null
          care_tips?: string[] | null
          created_at?: string
          diseases?: string[] | null
          facility_id?: string | null
          group_id?: string | null
          id?: string
          medicines?: Json | null
          primary_caregiver_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_info_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "care_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_info_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_info_primary_caregiver_id_fkey"
            columns: ["primary_caregiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_locations: {
        Row: {
          created_at: string
          current_location: Json | null
          group_id: string | null
          id: string
          location_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_location?: Json | null
          group_id?: string | null
          id?: string
          location_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_location?: Json | null
          group_id?: string | null
          id?: string
          location_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_locations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: true
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability_settings: Json | null
          contact_info: string | null
          created_at: string
          facility_id: string | null
          first_name: string | null
          id: string
          last_name: string | null
          notification_preferences: Json | null
          notification_settings: Json | null
          privacy_preferences: Json | null
          professional_credentials: Json | null
          relationship_to_patient: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          availability_settings?: Json | null
          contact_info?: string | null
          created_at?: string
          facility_id?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          notification_preferences?: Json | null
          notification_settings?: Json | null
          privacy_preferences?: Json | null
          professional_credentials?: Json | null
          relationship_to_patient?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          availability_settings?: Json | null
          contact_info?: string | null
          created_at?: string
          facility_id?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notification_preferences?: Json | null
          notification_settings?: Json | null
          privacy_preferences?: Json | null
          professional_credentials?: Json | null
          relationship_to_patient?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "care_facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_directory: {
        Row: {
          category: string
          contact_info: Json | null
          created_at: string
          description: string | null
          id: string
          location: Json | null
          name: string
          ratings: Json | null
          updated_at: string
          verified: boolean | null
        }
        Insert: {
          category: string
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          location?: Json | null
          name: string
          ratings?: Json | null
          updated_at?: string
          verified?: boolean | null
        }
        Update: {
          category?: string
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          location?: Json | null
          name?: string
          ratings?: Json | null
          updated_at?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          group_id: string | null
          id: string
          priority: string | null
          privacy_level: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          group_id?: string | null
          id?: string
          priority?: string | null
          privacy_level?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          group_id?: string | null
          id?: string
          priority?: string | null
          privacy_level?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      team_messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          group_id: string | null
          id: string
          message_type: string | null
          sender_id: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          group_id?: string | null
          id?: string
          message_type?: string | null
          sender_id?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          group_id?: string | null
          id?: string
          message_type?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishes: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          group_id: string | null
          id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          group_id?: string | null
          id?: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          group_id?: string | null
          id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishes_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type:
        | "patient"
        | "family_caregiver"
        | "professional_caregiver"
        | "care_facility_staff"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
