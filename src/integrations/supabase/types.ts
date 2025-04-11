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
          created_at: string | null
          id: string
          interaction_type: string
          product_id: string
          user_id: string
        }
        Insert: {
          affiliate_link?: string | null
          created_at?: string | null
          id?: string
          interaction_type: string
          product_id: string
          user_id: string
        }
        Update: {
          affiliate_link?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
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
          updated_at: string | null
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
          updated_at?: string | null
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
          updated_at?: string | null
        }
        Relationships: []
      }
      background_checks: {
        Row: {
          check_type: string
          created_at: string | null
          id: string
          provider: string | null
          results: Json | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          check_type: string
          created_at?: string | null
          id?: string
          provider?: string | null
          results?: Json | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          check_type?: string
          created_at?: string | null
          id?: string
          provider?: string | null
          results?: Json | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      care_analytics: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          metric_value: Json
          recorded_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          metric_value: Json
          recorded_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          metric_value?: Json
          recorded_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      care_circle_invites: {
        Row: {
          created_at: string | null
          email: string
          group_id: string
          id: string
          role: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          group_id: string
          id?: string
          role: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          group_id?: string
          id?: string
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      care_connections: {
        Row: {
          connection_type: string
          created_at: string | null
          id: string
          recipient_id: string
          requester_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          connection_type: string
          created_at?: string | null
          id?: string
          recipient_id: string
          requester_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          connection_type?: string
          created_at?: string | null
          id?: string
          recipient_id?: string
          requester_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      care_facilities: {
        Row: {
          address: string
          amenities: string[] | null
          availability: boolean | null
          created_at: string | null
          description: string
          email: string | null
          facility_type: string
          id: string
          insurance_accepted: string[] | null
          listing_type: string | null
          location: string
          name: string
          phone: string | null
          price_range: string | null
          rating: number | null
          reviews_count: number | null
          services: string[] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address: string
          amenities?: string[] | null
          availability?: boolean | null
          created_at?: string | null
          description: string
          email?: string | null
          facility_type: string
          id?: string
          insurance_accepted?: string[] | null
          listing_type?: string | null
          location: string
          name: string
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          reviews_count?: number | null
          services?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          amenities?: string[] | null
          availability?: boolean | null
          created_at?: string | null
          description?: string
          email?: string | null
          facility_type?: string
          id?: string
          insurance_accepted?: string[] | null
          listing_type?: string | null
          location?: string
          name?: string
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          reviews_count?: number | null
          services?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      care_group_members: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          member_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          member_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          member_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      care_groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          privacy_settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          privacy_settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          privacy_settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      care_notes: {
        Row: {
          attachments: Json | null
          author_id: string
          category: string
          content: string
          created_at: string | null
          id: string
          tags: string[] | null
          team_id: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          attachments?: Json | null
          author_id: string
          category: string
          content: string
          created_at?: string | null
          id?: string
          tags?: string[] | null
          team_id: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          attachments?: Json | null
          author_id?: string
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          tags?: string[] | null
          team_id?: string
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_notes_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "care_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      care_outcome_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_type: string
          recorded_at: string | null
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_type: string
          recorded_at?: string | null
          updated_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_type?: string
          recorded_at?: string | null
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      care_products: {
        Row: {
          affiliate_link: string | null
          category: string
          created_at: string | null
          description: string
          features: string[] | null
          id: string
          image_url: string | null
          name: string
          price: number
          rating: number | null
          reviews_count: number | null
          updated_at: string | null
        }
        Insert: {
          affiliate_link?: string | null
          category: string
          created_at?: string | null
          description: string
          features?: string[] | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          rating?: number | null
          reviews_count?: number | null
          updated_at?: string | null
        }
        Update: {
          affiliate_link?: string | null
          category?: string
          created_at?: string | null
          description?: string
          features?: string[] | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          rating?: number | null
          reviews_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      care_quality_metrics: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          metric_value: number
          recorded_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          metric_value: number
          recorded_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          metric_value?: number
          recorded_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      care_recipients: {
        Row: {
          care_needs: Json | null
          created_at: string | null
          date_of_birth: string | null
          first_name: string
          gender: string | null
          group_id: string
          id: string
          last_name: string
          medical_history: Json | null
          preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          care_needs?: Json | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name: string
          gender?: string | null
          group_id: string
          id?: string
          last_name: string
          medical_history?: Json | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          care_needs?: Json | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string
          gender?: string | null
          group_id?: string
          id?: string
          last_name?: string
          medical_history?: Json | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      care_reviews: {
        Row: {
          caregiver_id: string
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          reviewer_id: string
          updated_at: string | null
        }
        Insert: {
          caregiver_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          reviewer_id: string
          updated_at?: string | null
        }
        Update: {
          caregiver_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          reviewer_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      care_routines: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          tasks: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          tasks?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          tasks?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      care_tasks: {
        Row: {
          assigned_to: string | null
          category: string
          completed_at: string | null
          completed_by: string | null
          completion_notes: string | null
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          recurrence_pattern: Json | null
          recurring: boolean | null
          status: string | null
          team_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority: string
          recurrence_pattern?: Json | null
          recurring?: boolean | null
          status?: string | null
          team_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          recurrence_pattern?: Json | null
          recurring?: boolean | null
          status?: string | null
          team_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_tasks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "care_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      care_team_availability: {
        Row: {
          available_days: string[]
          available_hours: Json
          created_at: string | null
          group_id: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_days: string[]
          available_hours: Json
          created_at?: string | null
          group_id: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_days?: string[]
          available_hours?: Json
          created_at?: string | null
          group_id?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      care_team_members: {
        Row: {
          created_at: string | null
          id: string
          joined_at: string | null
          permissions: Json | null
          role: string
          status: string | null
          team_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          permissions?: Json | null
          role: string
          status?: string | null
          team_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          permissions?: Json | null
          role?: string
          status?: string | null
          team_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "care_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      care_teams: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
          primary_caregiver: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          primary_caregiver?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          primary_caregiver?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      care_updates: {
        Row: {
          content: string
          created_at: string | null
          group_id: string
          id: string
          update_type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          group_id: string
          id?: string
          update_type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          group_id?: string
          id?: string
          update_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      caregiver_availability: {
        Row: {
          caregiver_id: string
          created_at: string | null
          day_of_week: string
          end_time: string
          id: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          caregiver_id: string
          created_at?: string | null
          day_of_week: string
          end_time: string
          id?: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          caregiver_id?: string
          created_at?: string | null
          day_of_week?: string
          end_time?: string
          id?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      caregiver_bookings: {
        Row: {
          caregiver_id: string
          created_at: string | null
          end_time: string
          id: string
          notes: string | null
          rate: number
          start_time: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          caregiver_id: string
          created_at?: string | null
          end_time: string
          id?: string
          notes?: string | null
          rate: number
          start_time: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          caregiver_id?: string
          created_at?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          rate?: number
          start_time?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      caregiver_profiles: {
        Row: {
          availability: string[] | null
          bio: string | null
          certifications: string[] | null
          created_at: string | null
          experience_years: number | null
          first_name: string
          hourly_rate: number
          id: string
          last_name: string
          latitude: number | null
          location: string | null
          longitude: number | null
          rating: number | null
          reviews_count: number | null
          specialties: string[] | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          availability?: string[] | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          experience_years?: number | null
          first_name: string
          hourly_rate: number
          id: string
          last_name: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          rating?: number | null
          reviews_count?: number | null
          specialties?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          availability?: string[] | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          experience_years?: number | null
          first_name?: string
          hourly_rate?: number
          id?: string
          last_name?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          rating?: number | null
          reviews_count?: number | null
          specialties?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      companion_activity_templates: {
        Row: {
          benefits: string[] | null
          category: string
          created_at: string | null
          description: string
          difficulty: string
          duration: number
          id: string
          materials_needed: string[] | null
          steps: Json
          suitable_for: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          benefits?: string[] | null
          category: string
          created_at?: string | null
          description: string
          difficulty: string
          duration: number
          id?: string
          materials_needed?: string[] | null
          steps: Json
          suitable_for?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          benefits?: string[] | null
          category?: string
          created_at?: string | null
          description?: string
          difficulty?: string
          duration?: number
          id?: string
          materials_needed?: string[] | null
          steps?: Json
          suitable_for?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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
          hourly_rate: number
          id: string
          identity_verified: boolean | null
          in_person_meeting_preference: boolean | null
          interests: string[] | null
          languages: string[] | null
          mental_health_specialties: string[] | null
          music_therapy_certified: boolean | null
          rating: number | null
          support_tools_proficiency: Json | null
          updated_at: string | null
          user_id: string
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
          hourly_rate: number
          id?: string
          identity_verified?: boolean | null
          in_person_meeting_preference?: boolean | null
          interests?: string[] | null
          languages?: string[] | null
          mental_health_specialties?: string[] | null
          music_therapy_certified?: boolean | null
          rating?: number | null
          support_tools_proficiency?: Json | null
          updated_at?: string | null
          user_id: string
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
          hourly_rate?: number
          id?: string
          identity_verified?: boolean | null
          in_person_meeting_preference?: boolean | null
          interests?: string[] | null
          languages?: string[] | null
          mental_health_specialties?: string[] | null
          music_therapy_certified?: boolean | null
          rating?: number | null
          support_tools_proficiency?: Json | null
          updated_at?: string | null
          user_id?: string
          virtual_meeting_preference?: boolean | null
          virtual_meeting_tools?: string[] | null
        }
        Relationships: []
      }
      danger_zone_types: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dementia_profiles: {
        Row: {
          care_needs: string[] | null
          created_at: string | null
          id: string
          stage: string
          symptoms: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          care_needs?: string[] | null
          created_at?: string | null
          id?: string
          stage: string
          symptoms?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          care_needs?: string[] | null
          created_at?: string | null
          id?: string
          stage?: string
          symptoms?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      facility_leads: {
        Row: {
          created_at: string | null
          facility_id: string
          id: string
          notes: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          facility_id: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          facility_id?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      geofences: {
        Row: {
          center_lat: number
          center_lng: number
          created_at: string | null
          group_id: string
          id: string
          name: string
          radius: number
          type: string
          updated_at: string | null
        }
        Insert: {
          center_lat: number
          center_lng: number
          created_at?: string | null
          group_id: string
          id?: string
          name: string
          radius: number
          type: string
          updated_at?: string | null
        }
        Update: {
          center_lat?: number
          center_lng?: number
          created_at?: string | null
          group_id?: string
          id?: string
          name?: string
          radius?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      group_posts: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          group_id: string
          id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          group_id: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          group_id?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      insurance_analytics: {
        Row: {
          created_at: string | null
          id: string
          type: string
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          type: string
          updated_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          type?: string
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      insurance_claims: {
        Row: {
          claim_amount: number
          created_at: string | null
          id: string
          insurance_id: string
          processing_notes: string | null
          service_date: string
          service_type: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          claim_amount: number
          created_at?: string | null
          id?: string
          insurance_id: string
          processing_notes?: string | null
          service_date: string
          service_type: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          claim_amount?: number
          created_at?: string | null
          id?: string
          insurance_id?: string
          processing_notes?: string | null
          service_date?: string
          service_type?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      insurance_deductibles: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          insurance_id: string
          remaining: number
          type: string
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          insurance_id: string
          remaining: number
          type: string
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          insurance_id?: string
          remaining?: number
          type?: string
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      insurance_documents: {
        Row: {
          created_at: string | null
          document_type: string
          file_url: string
          id: string
          insurance_id: string
          metadata: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_type: string
          file_url: string
          id?: string
          insurance_id: string
          metadata?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_type?: string
          file_url?: string
          id?: string
          insurance_id?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      insurance_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      insurance_plan_benefits: {
        Row: {
          coverage_percentage: number
          created_at: string | null
          deductible_applies: boolean | null
          id: string
          max_benefit: number | null
          notes: string | null
          plan_id: string
          service_category: string
          updated_at: string | null
        }
        Insert: {
          coverage_percentage: number
          created_at?: string | null
          deductible_applies?: boolean | null
          id?: string
          max_benefit?: number | null
          notes?: string | null
          plan_id: string
          service_category: string
          updated_at?: string | null
        }
        Update: {
          coverage_percentage?: number
          created_at?: string | null
          deductible_applies?: boolean | null
          id?: string
          max_benefit?: number | null
          notes?: string | null
          plan_id?: string
          service_category?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      insurance_plans: {
        Row: {
          coverage_details: Json
          created_at: string | null
          id: string
          name: string
          provider: string
          type: string
          updated_at: string | null
        }
        Insert: {
          coverage_details?: Json
          created_at?: string | null
          id?: string
          name: string
          provider: string
          type: string
          updated_at?: string | null
        }
        Update: {
          coverage_details?: Json
          created_at?: string | null
          id?: string
          name?: string
          provider?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      medical_device_data: {
        Row: {
          created_at: string | null
          device_type: string
          id: string
          readings: Json
          recorded_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_type: string
          id?: string
          readings: Json
          recorded_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_type?: string
          id?: string
          readings?: Json
          recorded_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      medical_documents: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          document_type: string | null
          file_url: string | null
          group_id: string
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_type?: string | null
          file_url?: string | null
          group_id: string
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_type?: string | null
          file_url?: string | null
          group_id?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      medication_adherence_trends: {
        Row: {
          adherence_rate: number | null
          created_at: string | null
          date: string
          group_id: string
          id: string
          missed_doses: number | null
          total_doses: number | null
        }
        Insert: {
          adherence_rate?: number | null
          created_at?: string | null
          date: string
          group_id: string
          id?: string
          missed_doses?: number | null
          total_doses?: number | null
        }
        Update: {
          adherence_rate?: number | null
          created_at?: string | null
          date?: string
          group_id?: string
          id?: string
          missed_doses?: number | null
          total_doses?: number | null
        }
        Relationships: []
      }
      medication_portal_settings: {
        Row: {
          accessibility_settings: Json | null
          created_at: string | null
          group_id: string
          id: string
          reminder_preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          accessibility_settings?: Json | null
          created_at?: string | null
          group_id: string
          id?: string
          reminder_preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          accessibility_settings?: Json | null
          created_at?: string | null
          group_id?: string
          id?: string
          reminder_preferences?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      medication_schedules: {
        Row: {
          created_at: string | null
          dosage: string | null
          frequency: string
          group_id: string
          id: string
          medication_name: string
          time_of_day: string[]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          frequency: string
          group_id: string
          id?: string
          medication_name: string
          time_of_day: string[]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          frequency?: string
          group_id?: string
          id?: string
          medication_name?: string
          time_of_day?: string[]
          updated_at?: string | null
        }
        Relationships: []
      }
      medication_supervision_summary: {
        Row: {
          approved_medications: number | null
          avg_verification_time_minutes: number | null
          created_at: string | null
          group_id: string
          id: string
          missed_medications: number | null
          pending_verifications: number | null
          supervisor_id: string | null
          total_medications: number | null
          updated_at: string | null
        }
        Insert: {
          approved_medications?: number | null
          avg_verification_time_minutes?: number | null
          created_at?: string | null
          group_id: string
          id?: string
          missed_medications?: number | null
          pending_verifications?: number | null
          supervisor_id?: string | null
          total_medications?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_medications?: number | null
          avg_verification_time_minutes?: number | null
          created_at?: string | null
          group_id?: string
          id?: string
          missed_medications?: number | null
          pending_verifications?: number | null
          supervisor_id?: string | null
          total_medications?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      medication_verifications: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          photo_url: string | null
          status: string | null
          updated_at: string | null
          verification_time: string | null
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          photo_url?: string | null
          status?: string | null
          updated_at?: string | null
          verification_time?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          photo_url?: string | null
          status?: string | null
          updated_at?: string | null
          verification_time?: string | null
        }
        Relationships: []
      }
      patient_check_ins: {
        Row: {
          caregiver_notes: string | null
          check_in_type: string
          completed_time: string | null
          created_at: string | null
          group_id: string
          id: string
          medication_taken: boolean | null
          mood_score: number | null
          nutrition_log: Json | null
          pain_level: number | null
          photo_verification_url: string | null
          response_data: Json | null
          scheduled_time: string | null
          sleep_hours: number | null
          social_interactions: string[] | null
          status: string | null
          updated_at: string | null
          vital_signs: Json | null
        }
        Insert: {
          caregiver_notes?: string | null
          check_in_type: string
          completed_time?: string | null
          created_at?: string | null
          group_id: string
          id?: string
          medication_taken?: boolean | null
          mood_score?: number | null
          nutrition_log?: Json | null
          pain_level?: number | null
          photo_verification_url?: string | null
          response_data?: Json | null
          scheduled_time?: string | null
          sleep_hours?: number | null
          social_interactions?: string[] | null
          status?: string | null
          updated_at?: string | null
          vital_signs?: Json | null
        }
        Update: {
          caregiver_notes?: string | null
          check_in_type?: string
          completed_time?: string | null
          created_at?: string | null
          group_id?: string
          id?: string
          medication_taken?: boolean | null
          mood_score?: number | null
          nutrition_log?: Json | null
          pain_level?: number | null
          photo_verification_url?: string | null
          response_data?: Json | null
          scheduled_time?: string | null
          sleep_hours?: number | null
          social_interactions?: string[] | null
          status?: string | null
          updated_at?: string | null
          vital_signs?: Json | null
        }
        Relationships: []
      }
      patient_info: {
        Row: {
          allergies: string[] | null
          care_preferences: Json | null
          created_at: string | null
          emergency_contacts: Json | null
          id: string
          medical_conditions: string[] | null
          medications: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allergies?: string[] | null
          care_preferences?: Json | null
          created_at?: string | null
          emergency_contacts?: Json | null
          id?: string
          medical_conditions?: string[] | null
          medications?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allergies?: string[] | null
          care_preferences?: Json | null
          created_at?: string | null
          emergency_contacts?: Json | null
          id?: string
          medical_conditions?: string[] | null
          medications?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      patient_locations: {
        Row: {
          created_at: string | null
          current_location: Json | null
          group_id: string
          id: string
          location_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_location?: Json | null
          group_id: string
          id?: string
          location_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_location?: Json | null
          group_id?: string
          id?: string
          location_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      private_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          recipient_id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          recipient_id: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          group_id: string
          id: string
          priority: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          group_id: string
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          group_id?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      team_messages: {
        Row: {
          content: string
          created_at: string | null
          group_id: string
          id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          group_id: string
          id?: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          group_id?: string
          id?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      temp_services: {
        Row: {
          category: string
          compatibility: Json | null
          created_at: string
          description: string
          features: Json
          id: string
          is_premium: boolean
          long_description: string | null
          name: string
          rating: number
          review_summary: Json | null
          updated_at: string
          url: string
        }
        Insert: {
          category: string
          compatibility?: Json | null
          created_at?: string
          description: string
          features?: Json
          id?: string
          is_premium?: boolean
          long_description?: string | null
          name: string
          rating?: number
          review_summary?: Json | null
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          compatibility?: Json | null
          created_at?: string
          description?: string
          features?: Json
          id?: string
          is_premium?: boolean
          long_description?: string | null
          name?: string
          rating?: number
          review_summary?: Json | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      user_insurance: {
        Row: {
          coverage_end_date: string | null
          coverage_start_date: string
          created_at: string | null
          group_number: string | null
          id: string
          insurance_plan_id: string
          policy_number: string
          updated_at: string | null
          user_id: string
          verification_status: string | null
        }
        Insert: {
          coverage_end_date?: string | null
          coverage_start_date: string
          created_at?: string | null
          group_number?: string | null
          id?: string
          insurance_plan_id: string
          policy_number: string
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
        }
        Update: {
          coverage_end_date?: string | null
          coverage_start_date?: string
          created_at?: string | null
          group_number?: string | null
          id?: string
          insurance_plan_id?: string
          policy_number?: string
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          created_at: string | null
          documents: Json
          id: string
          request_type: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          documents?: Json
          id?: string
          request_type: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          documents?: Json
          id?: string
          request_type?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      video_consultations: {
        Row: {
          created_at: string | null
          duration: number
          host_id: string
          id: string
          meeting_url: string | null
          participants: Json
          scheduled_time: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration: number
          host_id: string
          id?: string
          meeting_url?: string | null
          participants: Json
          scheduled_time: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number
          host_id?: string
          id?: string
          meeting_url?: string | null
          participants?: Json
          scheduled_time?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
