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
      availability_slots: {
        Row: {
          created_at: string | null
          day_of_week: string
          end_time: string
          id: string
          profile_id: string
          profile_type: string
          recurring: boolean | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: string
          end_time: string
          id?: string
          profile_id: string
          profile_type: string
          recurring?: boolean | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: string
          end_time?: string
          id?: string
          profile_id?: string
          profile_type?: string
          recurring?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profile_id"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      care_circle_invites: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          group_id: string | null
          id: string
          invited_by: string | null
          role: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          group_id?: string | null
          id?: string
          invited_by?: string | null
          role: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          group_id?: string | null
          id?: string
          invited_by?: string | null
          role?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_circle_invites_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_circle_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      care_connections: {
        Row: {
          connection_type: Database["public"]["Enums"]["connection_type"]
          created_at: string
          id: string
          recipient_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          connection_type: Database["public"]["Enums"]["connection_type"]
          created_at?: string
          id?: string
          recipient_id: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          connection_type?: Database["public"]["Enums"]["connection_type"]
          created_at?: string
          id?: string
          recipient_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_connections_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      care_home_metrics: {
        Row: {
          facility_id: string | null
          id: string
          metric_type: string
          metric_value: Json
          recorded_at: string | null
        }
        Insert: {
          facility_id?: string | null
          id?: string
          metric_type: string
          metric_value: Json
          recorded_at?: string | null
        }
        Update: {
          facility_id?: string | null
          id?: string
          metric_type?: string
          metric_value?: Json
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_home_metrics_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "care_facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      care_home_resources: {
        Row: {
          facility_id: string | null
          id: string
          last_restocked: string | null
          minimum_threshold: number
          notes: string | null
          quantity: number
          resource_name: string
          resource_type: string
          status: string | null
          unit: string
        }
        Insert: {
          facility_id?: string | null
          id?: string
          last_restocked?: string | null
          minimum_threshold: number
          notes?: string | null
          quantity: number
          resource_name: string
          resource_type: string
          status?: string | null
          unit: string
        }
        Update: {
          facility_id?: string | null
          id?: string
          last_restocked?: string | null
          minimum_threshold?: number
          notes?: string | null
          quantity?: number
          resource_name?: string
          resource_type?: string
          status?: string | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_home_resources_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "care_facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      care_home_staff_schedule: {
        Row: {
          department: string
          facility_id: string | null
          id: string
          notes: string | null
          shift_end: string
          shift_start: string
          shift_type: string
          staff_id: string | null
          status: string | null
        }
        Insert: {
          department: string
          facility_id?: string | null
          id?: string
          notes?: string | null
          shift_end: string
          shift_start: string
          shift_type: string
          staff_id?: string | null
          status?: string | null
        }
        Update: {
          department?: string
          facility_id?: string | null
          id?: string
          notes?: string | null
          shift_end?: string
          shift_start?: string
          shift_type?: string
          staff_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_home_staff_schedule_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "care_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_home_staff_schedule_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      care_plan_templates: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          schedule: Json | null
          tasks: Json
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          schedule?: Json | null
          tasks: Json
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          schedule?: Json | null
          tasks?: Json
          updated_at?: string | null
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
      care_quality_metrics: {
        Row: {
          group_id: string | null
          id: string
          metric_type: string
          metric_value: Json
          notes: string | null
          recorded_at: string | null
        }
        Insert: {
          group_id?: string | null
          id?: string
          metric_type: string
          metric_value: Json
          notes?: string | null
          recorded_at?: string | null
        }
        Update: {
          group_id?: string | null
          id?: string
          metric_type?: string
          metric_value?: Json
          notes?: string | null
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_quality_metrics_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      care_reviews: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          rating: number | null
          review_text: string | null
          reviewee_id: string | null
          reviewer_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          review_text?: string | null
          reviewee_id?: string | null
          reviewer_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          review_text?: string | null
          reviewee_id?: string | null
          reviewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      care_routines: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          frequency: string
          group_id: string | null
          id: string
          tasks: Json | null
          time_of_day: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          frequency: string
          group_id?: string | null
          id?: string
          tasks?: Json | null
          time_of_day?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          frequency?: string
          group_id?: string | null
          id?: string
          tasks?: Json | null
          time_of_day?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_routines_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_routines_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
        ]
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
      care_team_availability: {
        Row: {
          available_days: string[]
          available_hours: Json
          created_at: string | null
          group_id: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          available_days: string[]
          available_hours: Json
          created_at?: string | null
          group_id?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          available_days?: string[]
          available_hours?: Json
          created_at?: string | null
          group_id?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_team_availability_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_team_availability_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      care_updates: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          group_id: string | null
          id: string
          update_type: string
          visibility: string[] | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          group_id?: string | null
          id?: string
          update_type: string
          visibility?: string[] | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          group_id?: string | null
          id?: string
          update_type?: string
          visibility?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "care_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_updates_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      caregiver_bookings: {
        Row: {
          caregiver_id: string | null
          created_at: string | null
          end_time: string | null
          group_id: string | null
          id: string
          notes: string | null
          rate: number | null
          requester_id: string | null
          start_time: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          caregiver_id?: string | null
          created_at?: string | null
          end_time?: string | null
          group_id?: string | null
          id?: string
          notes?: string | null
          rate?: number | null
          requester_id?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          caregiver_id?: string | null
          created_at?: string | null
          end_time?: string | null
          group_id?: string | null
          id?: string
          notes?: string | null
          rate?: number | null
          requester_id?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_bookings_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "caregiver_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caregiver_bookings_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caregiver_bookings_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      caregiver_profiles: {
        Row: {
          availability: Json | null
          background_check_date: string | null
          background_check_status: string | null
          bio: string | null
          certifications: Json | null
          created_at: string | null
          dementia_care_certified: boolean | null
          emergency_response: boolean | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          identity_verified: boolean | null
          mental_health_certified: boolean | null
          preferred_hours: Json | null
          rating: number | null
          reference_check_status: string | null
          reviews_count: number | null
          service_radius: number | null
          skills: string[] | null
          specializations: string[] | null
          updated_at: string | null
          user_id: string | null
          verification_status: Json | null
        }
        Insert: {
          availability?: Json | null
          background_check_date?: string | null
          background_check_status?: string | null
          bio?: string | null
          certifications?: Json | null
          created_at?: string | null
          dementia_care_certified?: boolean | null
          emergency_response?: boolean | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          identity_verified?: boolean | null
          mental_health_certified?: boolean | null
          preferred_hours?: Json | null
          rating?: number | null
          reference_check_status?: string | null
          reviews_count?: number | null
          service_radius?: number | null
          skills?: string[] | null
          specializations?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: Json | null
        }
        Update: {
          availability?: Json | null
          background_check_date?: string | null
          background_check_status?: string | null
          bio?: string | null
          certifications?: Json | null
          created_at?: string | null
          dementia_care_certified?: boolean | null
          emergency_response?: boolean | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          identity_verified?: boolean | null
          mental_health_certified?: boolean | null
          preferred_hours?: Json | null
          rating?: number | null
          reference_check_status?: string | null
          reviews_count?: number | null
          service_radius?: number | null
          skills?: string[] | null
          specializations?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      check_in_settings: {
        Row: {
          automated_responses: boolean | null
          check_in_frequency: unknown | null
          created_at: string
          escalation_threshold: unknown | null
          group_id: string | null
          id: string
          notification_preferences: Json | null
          photo_required: boolean | null
          reminder_threshold: unknown | null
          required_check_in_types: string[] | null
          updated_at: string
          vital_signs_required: boolean | null
          voice_enabled: boolean | null
        }
        Insert: {
          automated_responses?: boolean | null
          check_in_frequency?: unknown | null
          created_at?: string
          escalation_threshold?: unknown | null
          group_id?: string | null
          id?: string
          notification_preferences?: Json | null
          photo_required?: boolean | null
          reminder_threshold?: unknown | null
          required_check_in_types?: string[] | null
          updated_at?: string
          vital_signs_required?: boolean | null
          voice_enabled?: boolean | null
        }
        Update: {
          automated_responses?: boolean | null
          check_in_frequency?: unknown | null
          created_at?: string
          escalation_threshold?: unknown | null
          group_id?: string | null
          id?: string
          notification_preferences?: Json | null
          photo_required?: boolean | null
          reminder_threshold?: unknown | null
          required_check_in_types?: string[] | null
          updated_at?: string
          vital_signs_required?: boolean | null
          voice_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "check_in_settings_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
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
      companion_meetings: {
        Row: {
          companion_id: string | null
          created_at: string | null
          end_time: string | null
          group_id: string | null
          id: string
          location: Json | null
          meeting_link: string | null
          meeting_type: string | null
          notes: string | null
          rate: number | null
          requester_id: string | null
          start_time: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          companion_id?: string | null
          created_at?: string | null
          end_time?: string | null
          group_id?: string | null
          id?: string
          location?: Json | null
          meeting_link?: string | null
          meeting_type?: string | null
          notes?: string | null
          rate?: number | null
          requester_id?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          companion_id?: string | null
          created_at?: string | null
          end_time?: string | null
          group_id?: string | null
          id?: string
          location?: Json | null
          meeting_link?: string | null
          meeting_type?: string | null
          notes?: string | null
          rate?: number | null
          requester_id?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companion_meetings_companion_id_fkey"
            columns: ["companion_id"]
            isOneToOne: false
            referencedRelation: "companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companion_meetings_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companion_meetings_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companion_profiles: {
        Row: {
          availability: Json | null
          background_check_date: string | null
          bio: string | null
          communication_preferences: string[] | null
          created_at: string | null
          dementia_experience: boolean | null
          expertise_areas: string[] | null
          hourly_rate: number | null
          id: string
          identity_verified: boolean | null
          in_person_meeting_preference: boolean | null
          interests: string[] | null
          languages: string[] | null
          mental_health_support: boolean | null
          preferred_activities: string[] | null
          rating: number | null
          reference_check_status: string | null
          reviews_count: number | null
          updated_at: string | null
          user_id: string | null
          virtual_meeting_preference: boolean | null
        }
        Insert: {
          availability?: Json | null
          background_check_date?: string | null
          bio?: string | null
          communication_preferences?: string[] | null
          created_at?: string | null
          dementia_experience?: boolean | null
          expertise_areas?: string[] | null
          hourly_rate?: number | null
          id?: string
          identity_verified?: boolean | null
          in_person_meeting_preference?: boolean | null
          interests?: string[] | null
          languages?: string[] | null
          mental_health_support?: boolean | null
          preferred_activities?: string[] | null
          rating?: number | null
          reference_check_status?: string | null
          reviews_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          virtual_meeting_preference?: boolean | null
        }
        Update: {
          availability?: Json | null
          background_check_date?: string | null
          bio?: string | null
          communication_preferences?: string[] | null
          created_at?: string | null
          dementia_experience?: boolean | null
          expertise_areas?: string[] | null
          hourly_rate?: number | null
          id?: string
          identity_verified?: boolean | null
          in_person_meeting_preference?: boolean | null
          interests?: string[] | null
          languages?: string[] | null
          mental_health_support?: boolean | null
          preferred_activities?: string[] | null
          rating?: number | null
          reference_check_status?: string | null
          reviews_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          virtual_meeting_preference?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "companion_profiles_user_id_fkey"
            columns: ["user_id"]
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
      medical_device_data: {
        Row: {
          device_id: string | null
          device_type: string
          group_id: string | null
          id: string
          metadata: Json | null
          readings: Json
          recorded_at: string | null
          status: string | null
        }
        Insert: {
          device_id?: string | null
          device_type: string
          group_id?: string | null
          id?: string
          metadata?: Json | null
          readings: Json
          recorded_at?: string | null
          status?: string | null
        }
        Update: {
          device_id?: string | null
          device_type?: string
          group_id?: string | null
          id?: string
          metadata?: Json | null
          readings?: Json
          recorded_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_device_data_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
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
      medication_schedules: {
        Row: {
          created_at: string | null
          dosage: string | null
          end_date: string | null
          frequency: string
          group_id: string | null
          id: string
          instructions: string | null
          medication_name: string
          start_date: string | null
          time_of_day: string[]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency: string
          group_id?: string | null
          id?: string
          instructions?: string | null
          medication_name: string
          start_date?: string | null
          time_of_day: string[]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string
          group_id?: string | null
          id?: string
          instructions?: string | null
          medication_name?: string
          start_date?: string | null
          time_of_day?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_schedules_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_check_ins: {
        Row: {
          care_routine_completed: Json | null
          caregiver_notes: string | null
          check_in_method: string | null
          check_in_type: string
          cognitive_score: number | null
          completed_time: string | null
          created_at: string | null
          escalation_level: string | null
          group_id: string | null
          id: string
          medication_taken: boolean | null
          mood_score: number | null
          nutrition_log: Json | null
          pain_level: number | null
          photo_verification_url: string | null
          response_data: Json | null
          scheduled_time: string | null
          sleep_hours: number | null
          social_interactions: Json | null
          status: string | null
          symptoms: Json | null
          updated_at: string | null
          vital_signs: Json | null
          weather_conditions: Json | null
          wellness_notes: string | null
        }
        Insert: {
          care_routine_completed?: Json | null
          caregiver_notes?: string | null
          check_in_method?: string | null
          check_in_type: string
          cognitive_score?: number | null
          completed_time?: string | null
          created_at?: string | null
          escalation_level?: string | null
          group_id?: string | null
          id?: string
          medication_taken?: boolean | null
          mood_score?: number | null
          nutrition_log?: Json | null
          pain_level?: number | null
          photo_verification_url?: string | null
          response_data?: Json | null
          scheduled_time?: string | null
          sleep_hours?: number | null
          social_interactions?: Json | null
          status?: string | null
          symptoms?: Json | null
          updated_at?: string | null
          vital_signs?: Json | null
          weather_conditions?: Json | null
          wellness_notes?: string | null
        }
        Update: {
          care_routine_completed?: Json | null
          caregiver_notes?: string | null
          check_in_method?: string | null
          check_in_type?: string
          cognitive_score?: number | null
          completed_time?: string | null
          created_at?: string | null
          escalation_level?: string | null
          group_id?: string | null
          id?: string
          medication_taken?: boolean | null
          mood_score?: number | null
          nutrition_log?: Json | null
          pain_level?: number | null
          photo_verification_url?: string | null
          response_data?: Json | null
          scheduled_time?: string | null
          sleep_hours?: number | null
          social_interactions?: Json | null
          status?: string | null
          symptoms?: Json | null
          updated_at?: string | null
          vital_signs?: Json | null
          weather_conditions?: Json | null
          wellness_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_check_ins_group_id_fkey"
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
      private_messages: {
        Row: {
          content: string
          created_at: string | null
          group_id: string | null
          id: string
          message_type: string | null
          read_at: string | null
          recipient_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          group_id?: string | null
          id?: string
          message_type?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          group_id?: string | null
          id?: string
          message_type?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "private_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      progress_reports: {
        Row: {
          created_at: string | null
          end_date: string | null
          generated_by: string | null
          group_id: string | null
          id: string
          report_data: Json
          report_type: string
          start_date: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          generated_by?: string | null
          group_id?: string | null
          id?: string
          report_data: Json
          report_type: string
          start_date?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          generated_by?: string | null
          group_id?: string | null
          id?: string
          report_data?: Json
          report_type?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_reports_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
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
      resource_library: {
        Row: {
          category: string
          content_data: Json | null
          content_type: string
          content_url: string | null
          created_at: string | null
          description: string | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content_data?: Json | null
          content_type: string
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content_data?: Json | null
          content_type?: string
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      respite_care_logs: {
        Row: {
          caregiver_id: string | null
          created_at: string | null
          end_time: string | null
          group_id: string | null
          id: string
          notes: string | null
          relief_caregiver_id: string | null
          start_time: string
        }
        Insert: {
          caregiver_id?: string | null
          created_at?: string | null
          end_time?: string | null
          group_id?: string | null
          id?: string
          notes?: string | null
          relief_caregiver_id?: string | null
          start_time: string
        }
        Update: {
          caregiver_id?: string | null
          created_at?: string | null
          end_time?: string | null
          group_id?: string | null
          id?: string
          notes?: string | null
          relief_caregiver_id?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "respite_care_logs_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respite_care_logs_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respite_care_logs_relief_caregiver_id_fkey"
            columns: ["relief_caregiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reviews: {
        Row: {
          booking_id: string
          care_quality_score: number | null
          communication_score: number | null
          created_at: string | null
          id: string
          provider_id: string
          rating: number
          reliability_score: number | null
          review_text: string | null
          reviewer_id: string
        }
        Insert: {
          booking_id: string
          care_quality_score?: number | null
          communication_score?: number | null
          created_at?: string | null
          id?: string
          provider_id: string
          rating: number
          reliability_score?: number | null
          review_text?: string | null
          reviewer_id: string
        }
        Update: {
          booking_id?: string
          care_quality_score?: number | null
          communication_score?: number | null
          created_at?: string | null
          id?: string
          provider_id?: string
          rating?: number
          reliability_score?: number | null
          review_text?: string | null
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_provider"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reviewer"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_groups: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          meeting_schedule: Json | null
          name: string
          updated_at: string | null
          virtual_meeting_link: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          meeting_schedule?: Json | null
          name: string
          updated_at?: string | null
          virtual_meeting_link?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          meeting_schedule?: Json | null
          name?: string
          updated_at?: string | null
          virtual_meeting_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      video_consultations: {
        Row: {
          created_at: string | null
          duration: number | null
          group_id: string | null
          host_id: string | null
          id: string
          meeting_url: string | null
          notes: string | null
          participants: Json | null
          scheduled_time: string
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          group_id?: string | null
          host_id?: string | null
          id?: string
          meeting_url?: string | null
          notes?: string | null
          participants?: Json | null
          scheduled_time: string
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          group_id?: string | null
          host_id?: string | null
          id?: string
          meeting_url?: string | null
          notes?: string | null
          participants?: Json | null
          scheduled_time?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_consultations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_consultations_host_id_fkey"
            columns: ["host_id"]
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
      check_group_access: {
        Args: {
          group_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      connection_type: "carer" | "pal"
      user_type:
        | "patient"
        | "family_caregiver"
        | "professional_caregiver"
        | "care_facility_staff"
        | "doctor"
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
