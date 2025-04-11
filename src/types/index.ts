
import { Json } from "@/integrations/supabase/types";

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  avatar_url?: string;
  role?: string;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender: UserProfile;
  role?: "user" | "assistant";
}

export interface CareTask {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "high" | "medium" | "low" | "urgent";
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
  completed_by?: string | null;
  team_id: string;
  created_by?: string;
  assigned_to?: string;
  category: string;
  recurrence_pattern?: any;
  recurring?: boolean;
}

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  connection_type: "carer" | "pal";
  status: string;
  created_at: string;
  updated_at: string;
  requester: UserProfile;
  recipient: UserProfile;
}

export interface Post {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  author: UserProfile;
}

export interface Task {
  id: string;
  title: string;
  due_date: string;
  status: string;
  priority: string;
  group_id: string;
}

export interface CareUpdate {
  id: string;
  content: string;
  update_type: string;
  created_at: string;
  author_id: string;
  author: UserProfile;
}

export interface Availability {
  id: string;
  user_id: string;
  available_days: string[];
  available_hours: Record<string, string[]>;
}

export interface CareRecipient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  care_needs: string[];
  special_requirements?: string[];
  medical_conditions?: string[];
  emergency_contacts?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  file_url: string;
  document_type: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface CompanionMatch {
  id: string;
  user: {
    first_name: string;
    last_name: string;
  };
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
  cognitive_engagement_activities: {
    memory_games?: string[];
    brain_teasers?: string[];
    social_activities?: string[];
    creative_exercises?: string[];
  };
  interests: string[];
}

export interface Disclaimer {
  id: string;
  type: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}
