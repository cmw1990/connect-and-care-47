export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // User Management
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string
          role: 'caregiver' | 'patient' | 'family' | 'professional' | 'admin'
          created_at: string
          updated_at: string
          preferences: Json
          status: 'active' | 'inactive' | 'pending'
        }
        Insert: Omit<Tables['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['users']['Insert']>
      }

      // Care Team Management
      care_teams: {
        Row: {
          id: string
          name: string
          patient_id: string
          primary_caregiver_id: string
          created_at: string
          updated_at: string
          status: 'active' | 'archived'
        }
        Insert: Omit<Tables['care_teams']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['care_teams']['Insert']>
      }

      care_team_members: {
        Row: {
          id: string
          care_team_id: string
          user_id: string
          role: 'primary' | 'secondary' | 'professional' | 'family'
          permissions: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['care_team_members']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['care_team_members']['Insert']>
      }

      // Care Planning
      care_plans: {
        Row: {
          id: string
          patient_id: string
          title: string
          description: string
          start_date: string
          end_date: string | null
          status: 'draft' | 'active' | 'completed' | 'archived'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['care_plans']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['care_plans']['Insert']>
      }

      care_plan_goals: {
        Row: {
          id: string
          care_plan_id: string
          title: string
          description: string
          target_date: string
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          progress: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['care_plan_goals']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['care_plan_goals']['Insert']>
      }

      // Health Monitoring
      vital_records: {
        Row: {
          id: string
          patient_id: string
          type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'blood_sugar' | 'weight' | 'oxygen'
          value: Json
          recorded_at: string
          recorded_by: string
          device_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Tables['vital_records']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['vital_records']['Insert']>
      }

      health_logs: {
        Row: {
          id: string
          patient_id: string
          category: 'activity' | 'sleep' | 'nutrition' | 'mood' | 'symptoms' | 'medication'
          data: Json
          start_time: string
          end_time: string | null
          source: 'manual' | 'device' | 'integration'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['health_logs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['health_logs']['Insert']>
      }

      // Medication Management
      medications: {
        Row: {
          id: string
          patient_id: string
          name: string
          dosage: string
          frequency: Json
          start_date: string
          end_date: string | null
          prescriber_id: string
          pharmacy_id: string | null
          instructions: string
          side_effects: string[]
          status: 'active' | 'discontinued' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['medications']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['medications']['Insert']>
      }

      medication_logs: {
        Row: {
          id: string
          medication_id: string
          patient_id: string
          taken_at: string | null
          scheduled_for: string
          status: 'pending' | 'taken' | 'missed' | 'skipped'
          notes: string | null
          created_at: string
        }
        Insert: Omit<Tables['medication_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['medication_logs']['Insert']>
      }

      // Support Services
      service_providers: {
        Row: {
          id: string
          user_id: string
          service_type: 'caregiver' | 'companion' | 'professional' | 'facility'
          specialties: string[]
          availability: Json
          rate: number
          rating: number
          verification_status: 'pending' | 'verified' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['service_providers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['service_providers']['Insert']>
      }

      service_bookings: {
        Row: {
          id: string
          provider_id: string
          client_id: string
          service_type: string
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'refunded'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['service_bookings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['service_bookings']['Insert']>
      }

      // Facilities
      facilities: {
        Row: {
          id: string
          name: string
          type: 'nursing_home' | 'assisted_living' | 'retirement' | 'daycare'
          location: Json
          amenities: string[]
          capacity: number
          rating: number
          contact_info: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['facilities']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['facilities']['Insert']>
      }

      facility_reviews: {
        Row: {
          id: string
          facility_id: string
          reviewer_id: string
          rating: number
          review_text: string
          visit_date: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['facility_reviews']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['facility_reviews']['Insert']>
      }

      // Safety & Security
      safety_alerts: {
        Row: {
          id: string
          patient_id: string
          type: 'fall' | 'wandering' | 'medication' | 'emergency' | 'check_in'
          severity: 'low' | 'medium' | 'high' | 'critical'
          status: 'active' | 'acknowledged' | 'resolved'
          location: Json | null
          details: Json
          created_at: string
          resolved_at: string | null
        }
        Insert: Omit<Tables['safety_alerts']['Row'], 'id' | 'created_at' | 'resolved_at'>
        Update: Partial<Tables['safety_alerts']['Insert']>
      }

      check_ins: {
        Row: {
          id: string
          patient_id: string
          scheduled_time: string
          completed_time: string | null
          status: 'pending' | 'completed' | 'missed'
          response: Json | null
          created_at: string
        }
        Insert: Omit<Tables['check_ins']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['check_ins']['Insert']>
      }

      // Education & Resources
      resources: {
        Row: {
          id: string
          title: string
          description: string
          category: 'article' | 'video' | 'guide' | 'template'
          content_url: string
          tags: string[]
          author_id: string
          status: 'draft' | 'published' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['resources']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['resources']['Insert']>
      }

      learning_progress: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          progress: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['learning_progress']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['learning_progress']['Insert']>
      }

      // Marketplace
      products: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          price: number
          inventory: number
          manufacturer: string
          specifications: Json
          status: 'active' | 'out_of_stock' | 'discontinued'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['products']['Insert']>
      }

      orders: {
        Row: {
          id: string
          user_id: string
          items: Json[]
          total_amount: number
          status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          shipping_address: Json
          payment_status: 'pending' | 'paid' | 'refunded'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['orders']['Insert']>
      }

      // Communications
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          care_team_id: string | null
          content: string
          type: 'text' | 'image' | 'file' | 'alert'
          read_at: string | null
          created_at: string
        }
        Insert: Omit<Tables['messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['messages']['Insert']>
      }

      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          read_at: string | null
          created_at: string
        }
        Insert: Omit<Tables['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['notifications']['Insert']>
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
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
