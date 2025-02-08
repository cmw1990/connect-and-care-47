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
      affiliate_interactions: {
        Row: {
          affiliate_link: string | null
          clicked_at: string | null
          converted_at: string | null
          created_at: string | null
          id: string
          interaction_type: string
          product_id: string
          revenue_amount: number | null
          user_id: string | null
        }
        Insert: {
          affiliate_link?: string | null
          clicked_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          id?: string
          interaction_type: string
          product_id: string
          revenue_amount?: number | null
          user_id?: string | null
        }
        Update: {
          affiliate_link?: string | null
          clicked_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string
          product_id?: string
          revenue_amount?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          attendees: Json | null
          created_at: string | null
          description: string | null
          duration: number | null
          group_id: string | null
          id: string
          location: string | null
          reminder_sent: boolean | null
          scheduled_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          attendees?: Json | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          group_id?: string | null
          id?: string
          location?: string | null
          reminder_sent?: boolean | null
          scheduled_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          attendees?: Json | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          group_id?: string | null
          id?: string
          location?: string | null
          reminder_sent?: boolean | null
          scheduled_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
        ]
      }
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
          amenities: Json | null
          awards: Json | null
          city: string | null
          coordinates: unknown | null
          cost_range: Json | null
          country: string | null
          created_at: string
          description: string | null
          featured_until: string | null
          id: string
          listing_expires_at: string | null
          listing_type: string | null
          location: Json | null
          name: string
          ratings: Json | null
          region: string | null
          response_rate: number | null
          services: Json | null
          subscription_tier: string | null
          updated_at: string
          verified: boolean | null
          virtual_tour_url: string | null
        }
        Insert: {
          address?: string | null
          amenities?: Json | null
          awards?: Json | null
          city?: string | null
          coordinates?: unknown | null
          cost_range?: Json | null
          country?: string | null
          created_at?: string
          description?: string | null
          featured_until?: string | null
          id?: string
          listing_expires_at?: string | null
          listing_type?: string | null
          location?: Json | null
          name: string
          ratings?: Json | null
          region?: string | null
          response_rate?: number | null
          services?: Json | null
          subscription_tier?: string | null
          updated_at?: string
          verified?: boolean | null
          virtual_tour_url?: string | null
        }
        Update: {
          address?: string | null
          amenities?: Json | null
          awards?: Json | null
          city?: string | null
          coordinates?: unknown | null
          cost_range?: Json | null
          country?: string | null
          created_at?: string
          description?: string | null
          featured_until?: string | null
          id?: string
          listing_expires_at?: string | null
          listing_type?: string | null
          location?: Json | null
          name?: string
          ratings?: Json | null
          region?: string | null
          response_rate?: number | null
          services?: Json | null
          subscription_tier?: string | null
          updated_at?: string
          verified?: boolean | null
          virtual_tour_url?: string | null
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
          care_recipients: Json | null
          care_type: string[] | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          privacy_settings: Json | null
          updated_at: string
        }
        Insert: {
          care_recipients?: Json | null
          care_type?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          privacy_settings?: Json | null
          updated_at?: string
        }
        Update: {
          care_recipients?: Json | null
          care_type?: string[] | null
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
      care_outcome_metrics: {
        Row: {
          activity_completion_rate: number | null
          cognitive_improvement_score: number | null
          companion_meeting_id: string | null
          created_at: string
          emotional_wellbeing_score: number | null
          id: string
          notes: string | null
          social_engagement_level: number | null
        }
        Insert: {
          activity_completion_rate?: number | null
          cognitive_improvement_score?: number | null
          companion_meeting_id?: string | null
          created_at?: string
          emotional_wellbeing_score?: number | null
          id?: string
          notes?: string | null
          social_engagement_level?: number | null
        }
        Update: {
          activity_completion_rate?: number | null
          cognitive_improvement_score?: number | null
          companion_meeting_id?: string | null
          created_at?: string
          emotional_wellbeing_score?: number | null
          id?: string
          notes?: string | null
          social_engagement_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "care_outcome_metrics_companion_meeting_id_fkey"
            columns: ["companion_meeting_id"]
            isOneToOne: false
            referencedRelation: "companion_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_companion_meeting"
            columns: ["companion_meeting_id"]
            isOneToOne: false
            referencedRelation: "companion_meetings"
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
      care_recipients: {
        Row: {
          allergies: string[] | null
          care_needs: string[] | null
          created_at: string | null
          date_of_birth: string | null
          first_name: string
          group_id: string | null
          id: string
          last_name: string | null
          medical_conditions: string[] | null
          preferences: Json | null
          special_requirements: string[] | null
          updated_at: string | null
        }
        Insert: {
          allergies?: string[] | null
          care_needs?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name: string
          group_id?: string | null
          id?: string
          last_name?: string | null
          medical_conditions?: string[] | null
          preferences?: Json | null
          special_requirements?: string[] | null
          updated_at?: string | null
        }
        Update: {
          allergies?: string[] | null
          care_needs?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string
          group_id?: string | null
          id?: string
          last_name?: string | null
          medical_conditions?: string[] | null
          preferences?: Json | null
          special_requirements?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_recipients_group_id_fkey"
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
          verified_review: boolean | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          review_text?: string | null
          reviewee_id?: string | null
          reviewer_id?: string | null
          verified_review?: boolean | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          review_text?: string | null
          reviewee_id?: string | null
          reviewer_id?: string | null
          verified_review?: boolean | null
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
          age_groups_experience: string[] | null
          availability: Json | null
          background_check_date: string | null
          background_check_status: string | null
          bio: string | null
          certifications: Json | null
          child_care_certifications: Json | null
          cognitive_assessment_certified: boolean | null
          created_at: string | null
          crisis_intervention_certified: boolean | null
          cultural_sensitivity_training: boolean | null
          dementia_care_certified: boolean | null
          dementia_care_level: string | null
          emergency_response: boolean | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          identity_verified: boolean | null
          memory_support_tools: Json | null
          mental_health_certified: boolean | null
          pet_care_certifications: Json | null
          pet_types_experience: string[] | null
          preferred_hours: Json | null
          rating: number | null
          reference_check_status: string | null
          reviews_count: number | null
          service_radius: number | null
          skills: string[] | null
          special_needs_certifications: Json | null
          specializations: string[] | null
          specialized_care_certifications: Json | null
          updated_at: string | null
          user_id: string | null
          verification_status: Json | null
        }
        Insert: {
          age_groups_experience?: string[] | null
          availability?: Json | null
          background_check_date?: string | null
          background_check_status?: string | null
          bio?: string | null
          certifications?: Json | null
          child_care_certifications?: Json | null
          cognitive_assessment_certified?: boolean | null
          created_at?: string | null
          crisis_intervention_certified?: boolean | null
          cultural_sensitivity_training?: boolean | null
          dementia_care_certified?: boolean | null
          dementia_care_level?: string | null
          emergency_response?: boolean | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          identity_verified?: boolean | null
          memory_support_tools?: Json | null
          mental_health_certified?: boolean | null
          pet_care_certifications?: Json | null
          pet_types_experience?: string[] | null
          preferred_hours?: Json | null
          rating?: number | null
          reference_check_status?: string | null
          reviews_count?: number | null
          service_radius?: number | null
          skills?: string[] | null
          special_needs_certifications?: Json | null
          specializations?: string[] | null
          specialized_care_certifications?: Json | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: Json | null
        }
        Update: {
          age_groups_experience?: string[] | null
          availability?: Json | null
          background_check_date?: string | null
          background_check_status?: string | null
          bio?: string | null
          certifications?: Json | null
          child_care_certifications?: Json | null
          cognitive_assessment_certified?: boolean | null
          created_at?: string | null
          crisis_intervention_certified?: boolean | null
          cultural_sensitivity_training?: boolean | null
          dementia_care_certified?: boolean | null
          dementia_care_level?: string | null
          emergency_response?: boolean | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          identity_verified?: boolean | null
          memory_support_tools?: Json | null
          mental_health_certified?: boolean | null
          pet_care_certifications?: Json | null
          pet_types_experience?: string[] | null
          preferred_hours?: Json | null
          rating?: number | null
          reference_check_status?: string | null
          reviews_count?: number | null
          service_radius?: number | null
          skills?: string[] | null
          special_needs_certifications?: Json | null
          specializations?: string[] | null
          specialized_care_certifications?: Json | null
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
      chinese_regions: {
        Row: {
          created_at: string | null
          id: string
          name_en: string | null
          name_zh: string
          parent_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name_en?: string | null
          name_zh: string
          parent_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name_en?: string | null
          name_zh?: string
          parent_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chinese_regions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chinese_regions"
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
      companion_activity_templates: {
        Row: {
          category: string
          cognitive_benefits: string[] | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          emotional_benefits: string[] | null
          id: string
          instructions: Json | null
          materials_needed: string[] | null
          modifications_for_limitations: Json | null
          name: string
          social_benefits: string[] | null
        }
        Insert: {
          category: string
          cognitive_benefits?: string[] | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          emotional_benefits?: string[] | null
          id?: string
          instructions?: Json | null
          materials_needed?: string[] | null
          modifications_for_limitations?: Json | null
          name: string
          social_benefits?: string[] | null
        }
        Update: {
          category?: string
          cognitive_benefits?: string[] | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          emotional_benefits?: string[] | null
          id?: string
          instructions?: Json | null
          materials_needed?: string[] | null
          modifications_for_limitations?: Json | null
          name?: string
          social_benefits?: string[] | null
        }
        Relationships: []
      }
      companion_meetings: {
        Row: {
          activity_outcomes: Json | null
          companion_id: string | null
          created_at: string | null
          end_time: string | null
          engagement_metrics: Json | null
          group_id: string | null
          id: string
          location: Json | null
          meeting_link: string | null
          meeting_type: string | null
          mood_tracking: Json | null
          notes: string | null
          rate: number | null
          requester_id: string | null
          start_time: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          activity_outcomes?: Json | null
          companion_id?: string | null
          created_at?: string | null
          end_time?: string | null
          engagement_metrics?: Json | null
          group_id?: string | null
          id?: string
          location?: Json | null
          meeting_link?: string | null
          meeting_type?: string | null
          mood_tracking?: Json | null
          notes?: string | null
          rate?: number | null
          requester_id?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_outcomes?: Json | null
          companion_id?: string | null
          created_at?: string | null
          end_time?: string | null
          engagement_metrics?: Json | null
          group_id?: string | null
          id?: string
          location?: Json | null
          meeting_link?: string | null
          meeting_type?: string | null
          mood_tracking?: Json | null
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
          art_therapy_certified: boolean | null
          availability: Json | null
          background_check_date: string | null
          bio: string | null
          child_engagement_activities: Json | null
          cognitive_engagement_activities: Json | null
          communication_preferences: string[] | null
          created_at: string | null
          cultural_competencies: string[] | null
          dementia_experience: boolean | null
          expertise_areas: string[] | null
          hourly_rate: number | null
          id: string
          identity_verified: boolean | null
          in_person_meeting_preference: boolean | null
          interests: string[] | null
          languages: string[] | null
          mental_health_specialties: string[] | null
          mental_health_support: boolean | null
          music_therapy_certified: boolean | null
          pet_care_experience: string[] | null
          preferred_activities: string[] | null
          rating: number | null
          reference_check_status: string | null
          reviews_count: number | null
          special_needs_experience: Json | null
          support_tools_proficiency: Json | null
          updated_at: string | null
          user_id: string | null
          virtual_meeting_preference: boolean | null
          virtual_meeting_tools: string[] | null
        }
        Insert: {
          art_therapy_certified?: boolean | null
          availability?: Json | null
          background_check_date?: string | null
          bio?: string | null
          child_engagement_activities?: Json | null
          cognitive_engagement_activities?: Json | null
          communication_preferences?: string[] | null
          created_at?: string | null
          cultural_competencies?: string[] | null
          dementia_experience?: boolean | null
          expertise_areas?: string[] | null
          hourly_rate?: number | null
          id?: string
          identity_verified?: boolean | null
          in_person_meeting_preference?: boolean | null
          interests?: string[] | null
          languages?: string[] | null
          mental_health_specialties?: string[] | null
          mental_health_support?: boolean | null
          music_therapy_certified?: boolean | null
          pet_care_experience?: string[] | null
          preferred_activities?: string[] | null
          rating?: number | null
          reference_check_status?: string | null
          reviews_count?: number | null
          special_needs_experience?: Json | null
          support_tools_proficiency?: Json | null
          updated_at?: string | null
          user_id?: string | null
          virtual_meeting_preference?: boolean | null
          virtual_meeting_tools?: string[] | null
        }
        Update: {
          art_therapy_certified?: boolean | null
          availability?: Json | null
          background_check_date?: string | null
          bio?: string | null
          child_engagement_activities?: Json | null
          cognitive_engagement_activities?: Json | null
          communication_preferences?: string[] | null
          created_at?: string | null
          cultural_competencies?: string[] | null
          dementia_experience?: boolean | null
          expertise_areas?: string[] | null
          hourly_rate?: number | null
          id?: string
          identity_verified?: boolean | null
          in_person_meeting_preference?: boolean | null
          interests?: string[] | null
          languages?: string[] | null
          mental_health_specialties?: string[] | null
          mental_health_support?: boolean | null
          music_therapy_certified?: boolean | null
          pet_care_experience?: string[] | null
          preferred_activities?: string[] | null
          rating?: number | null
          reference_check_status?: string | null
          reviews_count?: number | null
          special_needs_experience?: Json | null
          support_tools_proficiency?: Json | null
          updated_at?: string | null
          user_id?: string | null
          virtual_meeting_preference?: boolean | null
          virtual_meeting_tools?: string[] | null
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
      facility_leads: {
        Row: {
          contact_preference: string | null
          contacted_at: string | null
          created_at: string | null
          email: string | null
          facility_id: string
          id: string
          is_contacted: boolean | null
          lead_status: string
          notes: string | null
          phone_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          contact_preference?: string | null
          contacted_at?: string | null
          created_at?: string | null
          email?: string | null
          facility_id: string
          id?: string
          is_contacted?: boolean | null
          lead_status?: string
          notes?: string | null
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          contact_preference?: string | null
          contacted_at?: string | null
          created_at?: string | null
          email?: string | null
          facility_id?: string
          id?: string
          is_contacted?: boolean | null
          lead_status?: string
          notes?: string | null
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      facility_review_metrics: {
        Row: {
          activities_rating: number | null
          amenities_rating: number | null
          care_quality_rating: number | null
          cleanliness_rating: number | null
          created_at: string | null
          facility_id: string | null
          id: string
          review_id: string | null
          staff_rating: number | null
          value_rating: number | null
        }
        Insert: {
          activities_rating?: number | null
          amenities_rating?: number | null
          care_quality_rating?: number | null
          cleanliness_rating?: number | null
          created_at?: string | null
          facility_id?: string | null
          id?: string
          review_id?: string | null
          staff_rating?: number | null
          value_rating?: number | null
        }
        Update: {
          activities_rating?: number | null
          amenities_rating?: number | null
          care_quality_rating?: number | null
          cleanliness_rating?: number | null
          created_at?: string | null
          facility_id?: string | null
          id?: string
          review_id?: string | null
          staff_rating?: number | null
          value_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "facility_review_metrics_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "care_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_review_metrics_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "care_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_review_responses: {
        Row: {
          created_at: string | null
          facility_id: string | null
          id: string
          responded_by: string | null
          response_text: string
          review_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          facility_id?: string | null
          id?: string
          responded_by?: string | null
          response_text: string
          review_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          facility_id?: string | null
          id?: string
          responded_by?: string | null
          response_text?: string
          review_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facility_review_responses_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "care_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "care_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_subscription_plans: {
        Row: {
          created_at: string | null
          duration: unknown
          features: Json
          id: string
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration: unknown
          features?: Json
          id?: string
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: unknown
          features?: Json
          id?: string
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      facility_subscriptions: {
        Row: {
          created_at: string | null
          end_date: string
          facility_id: string | null
          id: string
          payment_status: string | null
          plan_id: string | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          facility_id?: string | null
          id?: string
          payment_status?: string | null
          plan_id?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          facility_id?: string | null
          id?: string
          payment_status?: string | null
          plan_id?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facility_subscriptions_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "care_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "facility_subscription_plans"
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
      landing_sections: {
        Row: {
          active: boolean | null
          content: Json | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          section_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          content?: Json | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          section_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          content?: Json | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          section_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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
      medication_verification_settings: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          reminder_threshold_minutes: number | null
          require_double_verification: boolean | null
          require_photo: boolean | null
          updated_at: string | null
          verification_window_minutes: number | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          reminder_threshold_minutes?: number | null
          require_double_verification?: boolean | null
          require_photo?: boolean | null
          updated_at?: string | null
          verification_window_minutes?: number | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          reminder_threshold_minutes?: number | null
          require_double_verification?: boolean | null
          require_photo?: boolean | null
          updated_at?: string | null
          verification_window_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_verification_settings_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "care_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_verifications: {
        Row: {
          created_at: string
          group_id: string
          id: string
          medication_schedule_id: string | null
          notes: string | null
          photo_url: string | null
          rejection_reason: string | null
          side_effects: string[] | null
          status: string | null
          symptoms: Json | null
          verification_time: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          medication_schedule_id?: string | null
          notes?: string | null
          photo_url?: string | null
          rejection_reason?: string | null
          side_effects?: string[] | null
          status?: string | null
          symptoms?: Json | null
          verification_time: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          medication_schedule_id?: string | null
          notes?: string | null
          photo_url?: string | null
          rejection_reason?: string | null
          side_effects?: string[] | null
          status?: string | null
          symptoms?: Json | null
          verification_time?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_verifications_medication_schedule_id_fkey"
            columns: ["medication_schedule_id"]
            isOneToOne: false
            referencedRelation: "medication_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_assistance_tools: {
        Row: {
          category: string
          cognitive_areas: string[] | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          id: string
          instructions: Json | null
          name: string
        }
        Insert: {
          category: string
          cognitive_areas?: string[] | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          id?: string
          instructions?: Json | null
          name: string
        }
        Update: {
          category?: string
          cognitive_areas?: string[] | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          id?: string
          instructions?: Json | null
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      payment_history: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          payment_method: string | null
          status: string
          subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency: string
          id?: string
          payment_method?: string | null
          status: string
          subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          payment_method?: string | null
          status?: string
          subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_content: {
        Row: {
          content_type: string
          content_url: string | null
          created_at: string | null
          description: string | null
          id: string
          required_plan: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content_type: string
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          required_plan: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content_type?: string
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          required_plan?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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
          verification_date: string | null
          verification_documents: Json | null
          verification_status: Json | null
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
          verification_date?: string | null
          verification_documents?: Json | null
          verification_status?: Json | null
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
          verification_date?: string | null
          verification_documents?: Json | null
          verification_status?: Json | null
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
      regions: {
        Row: {
          continent: string | null
          coordinates: unknown | null
          country: string
          created_at: string
          id: number
          name: string
          parent_id: number | null
          population: number | null
          type: string
        }
        Insert: {
          continent?: string | null
          coordinates?: unknown | null
          country: string
          created_at?: string
          id?: number
          name: string
          parent_id?: number | null
          population?: number | null
          type: string
        }
        Update: {
          continent?: string | null
          coordinates?: unknown | null
          country?: string
          created_at?: string
          id?: number
          name?: string
          parent_id?: number | null
          population?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "regions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "regions"
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
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      subscription_features: {
        Row: {
          created_at: string | null
          feature_description: string | null
          feature_name: string
          id: string
          is_active: boolean | null
          plan_id: string
        }
        Insert: {
          created_at?: string | null
          feature_description?: string | null
          feature_name: string
          id?: string
          is_active?: boolean | null
          plan_id: string
        }
        Update: {
          created_at?: string | null
          feature_description?: string | null
          feature_name?: string
          id?: string
          is_active?: boolean | null
          plan_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
          completion_notes: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          group_id: string | null
          id: string
          priority: string | null
          privacy_level: string | null
          recurrence_pattern: Json | null
          recurring: boolean | null
          reminder_sent: boolean | null
          reminder_time: string | null
          status: string | null
          subtasks: Json | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          group_id?: string | null
          id?: string
          priority?: string | null
          privacy_level?: string | null
          recurrence_pattern?: Json | null
          recurring?: boolean | null
          reminder_sent?: boolean | null
          reminder_time?: string | null
          status?: string | null
          subtasks?: Json | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          group_id?: string | null
          id?: string
          priority?: string | null
          privacy_level?: string | null
          recurrence_pattern?: Json | null
          recurring?: boolean | null
          reminder_sent?: boolean | null
          reminder_time?: string | null
          status?: string | null
          subtasks?: Json | null
          tags?: string[] | null
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
      user_journey: {
        Row: {
          completed_at: string | null
          id: string
          journey_step: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          journey_step: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          journey_step?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          onboarding_completed: boolean | null
          preferred_service: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          onboarding_completed?: boolean | null
          preferred_service?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          onboarding_completed?: boolean | null
          preferred_service?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          documents: Json | null
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          profile_id: string | null
          request_type: string
          status: string | null
          submitted_at: string | null
        }
        Insert: {
          documents?: Json | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          profile_id?: string | null
          request_type: string
          status?: string | null
          submitted_at?: string | null
        }
        Update: {
          documents?: Json | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          profile_id?: string | null
          request_type?: string
          status?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_profile_id_fkey"
            columns: ["profile_id"]
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
      virtual_meeting_templates: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          instructions: Json | null
          materials_needed: string[] | null
          name: string
          suitable_for: string[] | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          instructions?: Json | null
          materials_needed?: string[] | null
          name: string
          suitable_for?: string[] | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          instructions?: Json | null
          materials_needed?: string[] | null
          name?: string
          suitable_for?: string[] | null
        }
        Relationships: []
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
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: {
          oldname: string
          newname: string
          version: string
        }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: {
          tbl: unknown
          col: string
        }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: {
          tbl: unknown
          att_name: string
          geom: unknown
          mode?: string
        }
        Returns: number
      }
      _st_3dintersects: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      _st_contains: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_coveredby:
        | {
            Args: {
              geog1: unknown
              geog2: unknown
            }
            Returns: boolean
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: boolean
          }
      _st_covers:
        | {
            Args: {
              geog1: unknown
              geog2: unknown
            }
            Returns: boolean
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: boolean
          }
      _st_crosses: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_intersects: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: {
          line1: unknown
          line2: unknown
        }
        Returns: number
      }
      _st_longestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      _st_orderingequals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_overlaps: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: {
          geom: unknown
        }
        Returns: number
      }
      _st_touches: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          g1: unknown
          clip?: unknown
          tolerance?: number
          return_polygons?: boolean
        }
        Returns: unknown
      }
      _st_within: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      addauth: {
        Args: {
          "": string
        }
        Returns: boolean
      }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
              new_srid_in: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              schema_name: string
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
            Returns: string
          }
      box:
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      box2d:
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      box2d_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box2d_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box2df_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box2df_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box3d:
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      box3d_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box3d_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box3dtobox: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      bytea:
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
      check_group_access: {
        Args: {
          group_id: string
        }
        Returns: boolean
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
            }
            Returns: string
          }
        | {
            Args: {
              schema_name: string
              table_name: string
              column_name: string
            }
            Returns: string
          }
        | {
            Args: {
              table_name: string
              column_name: string
            }
            Returns: string
          }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              table_name: string
            }
            Returns: string
          }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geography:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      geography_analyze: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geography_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geography_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      geography_typmod_out: {
        Args: {
          "": number
        }
        Returns: unknown
      }
      geometry:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      geometry_above: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_analyze: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      geometry_below: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_cmp: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      geometry_contained_3d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_contains: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      geometry_eq: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_ge: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      geometry_gt: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_hash: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      geometry_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_le: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_left: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_lt: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_overabove: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overleft: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overright: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_recv: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_right: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_same: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      geometry_sortsupport: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      geometry_typmod_out: {
        Args: {
          "": number
        }
        Returns: unknown
      }
      geometry_within: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometrytype:
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
      geomfromewkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      geomfromewkt: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      get_country_id: {
        Args: {
          country_name: string
        }
        Returns: number
      }
      get_proj4_from_srid: {
        Args: {
          "": number
        }
        Returns: string
      }
      get_state_id: {
        Args: {
          state_name: string
          country_name: string
        }
        Returns: number
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gidx_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      json: {
        Args: {
          "": unknown
        }
        Returns: Json
      }
      jsonb: {
        Args: {
          "": unknown
        }
        Returns: Json
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      path: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      point: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      polygon: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      populate_geometry_columns:
        | {
            Args: {
              tbl_oid: unknown
              use_typmod?: boolean
            }
            Returns: number
          }
        | {
            Args: {
              use_typmod?: boolean
            }
            Returns: string
          }
      postgis_addbbox: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: {
          geomschema: string
          geomtable: string
          geomcolumn: string
        }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: {
          geomschema: string
          geomtable: string
          geomcolumn: string
        }
        Returns: number
      }
      postgis_constraint_type: {
        Args: {
          geomschema: string
          geomtable: string
          geomcolumn: string
        }
        Returns: string
      }
      postgis_dropbbox: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          geomname: string
          coord_dimension: number
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: {
          "": number
        }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: {
          "": number
        }
        Returns: number
      }
      postgis_typmod_type: {
        Args: {
          "": number
        }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      spheroid_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      spheroid_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_3ddistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_3dintersects: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_3dlength: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_3dlongestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_3dperimeter: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_3dshortestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_addpoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_angle:
        | {
            Args: {
              line1: unknown
              line2: unknown
            }
            Returns: number
          }
        | {
            Args: {
              pt1: unknown
              pt2: unknown
              pt3: unknown
              pt4?: unknown
            }
            Returns: number
          }
      st_area:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              geog: unknown
              use_spheroid?: boolean
            }
            Returns: number
          }
      st_area2d: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_asbinary:
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
      st_asencodedpolyline: {
        Args: {
          geom: unknown
          nprecision?: number
        }
        Returns: string
      }
      st_asewkb: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_asewkt:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
      st_asgeojson:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              maxdecimaldigits?: number
              options?: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              maxdecimaldigits?: number
              options?: number
            }
            Returns: string
          }
        | {
            Args: {
              r: Record<string, unknown>
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
            }
            Returns: string
          }
      st_asgml:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              maxdecimaldigits?: number
              options?: number
            }
            Returns: string
          }
        | {
            Args: {
              version: number
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
            Returns: string
          }
        | {
            Args: {
              version: number
              geom: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
            Returns: string
          }
      st_ashexewkb: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_askml:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              maxdecimaldigits?: number
              nprefix?: string
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              maxdecimaldigits?: number
              nprefix?: string
            }
            Returns: string
          }
      st_aslatlontext: {
        Args: {
          geom: unknown
          tmpl?: string
        }
        Returns: string
      }
      st_asmarc21: {
        Args: {
          geom: unknown
          format?: string
        }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          geom: unknown
          bounds: unknown
          extent?: number
          buffer?: number
          clip_geom?: boolean
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              rel?: number
              maxdecimaldigits?: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              rel?: number
              maxdecimaldigits?: number
            }
            Returns: string
          }
      st_astext:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
      st_astwkb:
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: {
          geom: unknown
          maxdecimaldigits?: number
          options?: number
        }
        Returns: string
      }
      st_azimuth:
        | {
            Args: {
              geog1: unknown
              geog2: unknown
            }
            Returns: number
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: number
          }
      st_boundary: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: {
          geom: unknown
          fits?: boolean
        }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: {
              geom: unknown
              radius: number
              options?: string
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              radius: number
              quadsegs: number
            }
            Returns: unknown
          }
      st_buildarea: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_centroid:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      st_cleangeometry: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: {
          geom: unknown
          box: unknown
        }
        Returns: unknown
      }
      st_closestpoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: {
          "": unknown[]
        }
        Returns: unknown[]
      }
      st_collect:
        | {
            Args: {
              "": unknown[]
            }
            Returns: unknown
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: unknown
          }
      st_collectionextract: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_geom: unknown
          param_pctconvex: number
          param_allow_holes?: boolean
        }
        Returns: unknown
      }
      st_contains: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_containsproperly: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_convexhull: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_coorddim: {
        Args: {
          geometry: unknown
        }
        Returns: number
      }
      st_coveredby:
        | {
            Args: {
              geog1: unknown
              geog2: unknown
            }
            Returns: boolean
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: boolean
          }
      st_covers:
        | {
            Args: {
              geog1: unknown
              geog2: unknown
            }
            Returns: boolean
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: boolean
          }
      st_crosses: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_curvetoline: {
        Args: {
          geom: unknown
          tol?: number
          toltype?: number
          flags?: number
        }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: {
          g1: unknown
          tolerance?: number
          flags?: number
        }
        Returns: unknown
      }
      st_difference: {
        Args: {
          geom1: unknown
          geom2: unknown
          gridsize?: number
        }
        Returns: unknown
      }
      st_dimension: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_disjoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_distance:
        | {
            Args: {
              geog1: unknown
              geog2: unknown
              use_spheroid?: boolean
            }
            Returns: number
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: number
          }
      st_distancesphere:
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: number
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
              radius: number
            }
            Returns: number
          }
      st_distancespheroid: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_dump: {
        Args: {
          "": unknown
        }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: {
          "": unknown
        }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: {
          "": unknown
        }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: {
          "": unknown
        }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_envelope: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_equals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_expand:
        | {
            Args: {
              box: unknown
              dx: number
              dy: number
            }
            Returns: unknown
          }
        | {
            Args: {
              box: unknown
              dx: number
              dy: number
              dz?: number
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              dx: number
              dy: number
              dz?: number
              dm?: number
            }
            Returns: unknown
          }
      st_exteriorring: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_force2d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_force3d: {
        Args: {
          geom: unknown
          zvalue?: number
        }
        Returns: unknown
      }
      st_force3dm: {
        Args: {
          geom: unknown
          mvalue?: number
        }
        Returns: unknown
      }
      st_force3dz: {
        Args: {
          geom: unknown
          zvalue?: number
        }
        Returns: unknown
      }
      st_force4d: {
        Args: {
          geom: unknown
          zvalue?: number
          mvalue?: number
        }
        Returns: unknown
      }
      st_forcecollection: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcecurve: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcerhr: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcesfs: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_generatepoints:
        | {
            Args: {
              area: unknown
              npoints: number
            }
            Returns: unknown
          }
        | {
            Args: {
              area: unknown
              npoints: number
              seed: number
            }
            Returns: unknown
          }
      st_geogfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geohash:
        | {
            Args: {
              geog: unknown
              maxchars?: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              maxchars?: number
            }
            Returns: string
          }
      st_geomcollfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          g: unknown
          tolerance?: number
          max_iter?: number
          fail_if_not_converged?: boolean
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geometrytype: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_geomfromewkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromgeojson:
        | {
            Args: {
              "": Json
            }
            Returns: unknown
          }
        | {
            Args: {
              "": Json
            }
            Returns: unknown
          }
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
      st_geomfromgml: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: {
          marc21xml: string
        }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_gmltosql: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_hasarc: {
        Args: {
          geometry: unknown
        }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_hexagon: {
        Args: {
          size: number
          cell_i: number
          cell_j: number
          origin?: unknown
        }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: {
          size: number
          bounds: unknown
        }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: {
          line: unknown
          point: unknown
        }
        Returns: number
      }
      st_intersection: {
        Args: {
          geom1: unknown
          geom2: unknown
          gridsize?: number
        }
        Returns: unknown
      }
      st_intersects:
        | {
            Args: {
              geog1: unknown
              geog2: unknown
            }
            Returns: boolean
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: boolean
          }
      st_isclosed: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_iscollection: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_isempty: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_isring: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_issimple: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_isvalid: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: {
          geom: unknown
          flags?: number
        }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_length:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              geog: unknown
              use_spheroid?: boolean
            }
            Returns: number
          }
      st_length2d: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_letters: {
        Args: {
          letters: string
          font?: Json
        }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: {
          line1: unknown
          line2: unknown
        }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: {
          txtin: string
          nprecision?: number
        }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_linefromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_linemerge: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_linetocurve: {
        Args: {
          geometry: unknown
        }
        Returns: unknown
      }
      st_locatealong: {
        Args: {
          geometry: unknown
          measure: number
          leftrightoffset?: number
        }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          geometry: unknown
          frommeasure: number
          tomeasure: number
          leftrightoffset?: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: {
          geometry: unknown
          fromelevation: number
          toelevation: number
        }
        Returns: unknown
      }
      st_longestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_m: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_makebox2d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_makeline:
        | {
            Args: {
              "": unknown[]
            }
            Returns: unknown
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: unknown
          }
      st_makepolygon: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_makevalid:
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              params: string
            }
            Returns: unknown
          }
      st_maxdistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: {
          "": unknown
        }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: {
          inputgeom: unknown
          segs_per_quarter?: number
        }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: {
          "": unknown
        }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multi: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_ndims: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_node: {
        Args: {
          g: unknown
        }
        Returns: unknown
      }
      st_normalize: {
        Args: {
          geom: unknown
        }
        Returns: unknown
      }
      st_npoints: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_nrings: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numgeometries: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numinteriorring: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numinteriorrings: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numpatches: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numpoints: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_offsetcurve: {
        Args: {
          line: unknown
          distance: number
          params?: string
        }
        Returns: unknown
      }
      st_orderingequals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_overlaps: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_perimeter:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              geog: unknown
              use_spheroid?: boolean
            }
            Returns: number
          }
      st_perimeter2d: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_pointfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_points: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_polygonize: {
        Args: {
          "": unknown[]
        }
        Returns: unknown
      }
      st_project: {
        Args: {
          geog: unknown
          distance: number
          azimuth: number
        }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_x: number
          prec_y?: number
          prec_z?: number
          prec_m?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: {
          geom: unknown
          gridsize: number
        }
        Returns: unknown
      }
      st_relate: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: {
          geom: unknown
          tolerance?: number
        }
        Returns: unknown
      }
      st_reverse: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_segmentize: {
        Args: {
          geog: unknown
          max_segment_length: number
        }
        Returns: unknown
      }
      st_setsrid:
        | {
            Args: {
              geog: unknown
              srid: number
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              srid: number
            }
            Returns: unknown
          }
      st_sharedpaths: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_shortestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: {
          geom: unknown
          vertex_fraction: number
          is_outer?: boolean
        }
        Returns: unknown
      }
      st_split: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_square: {
        Args: {
          size: number
          cell_i: number
          cell_j: number
          origin?: unknown
        }
        Returns: unknown
      }
      st_squaregrid: {
        Args: {
          size: number
          bounds: unknown
        }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | {
            Args: {
              geog: unknown
            }
            Returns: number
          }
        | {
            Args: {
              geom: unknown
            }
            Returns: number
          }
      st_startpoint: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_subdivide: {
        Args: {
          geom: unknown
          maxvertices?: number
          gridsize?: number
        }
        Returns: unknown[]
      }
      st_summary:
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
      st_swapordinates: {
        Args: {
          geom: unknown
          ords: unknown
        }
        Returns: unknown
      }
      st_symdifference: {
        Args: {
          geom1: unknown
          geom2: unknown
          gridsize?: number
        }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          zoom: number
          x: number
          y: number
          bounds?: unknown
          margin?: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_transform:
        | {
            Args: {
              geom: unknown
              from_proj: string
              to_proj: string
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              from_proj: string
              to_srid: number
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              to_proj: string
            }
            Returns: unknown
          }
      st_triangulatepolygon: {
        Args: {
          g1: unknown
        }
        Returns: unknown
      }
      st_union:
        | {
            Args: {
              "": unknown[]
            }
            Returns: unknown
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
              gridsize: number
            }
            Returns: unknown
          }
      st_voronoilines: {
        Args: {
          g1: unknown
          tolerance?: number
          extend_to?: unknown
        }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: {
          g1: unknown
          tolerance?: number
          extend_to?: unknown
        }
        Returns: unknown
      }
      st_within: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: {
          wkb: string
        }
        Returns: unknown
      }
      st_wkttosql: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_wrapx: {
        Args: {
          geom: unknown
          wrap: number
          move: number
        }
        Returns: unknown
      }
      st_x: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_xmax: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_xmin: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_y: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_ymax: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_ymin: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_z: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_zmax: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_zmflag: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_zmin: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      text: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      unlockrows: {
        Args: {
          "": string
        }
        Returns: number
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          schema_name: string
          table_name: string
          column_name: string
          new_srid_in: number
        }
        Returns: string
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
        | "child_caregiver"
        | "pet_caregiver"
        | "special_needs_caregiver"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
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
