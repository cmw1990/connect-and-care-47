
export interface LocationData {
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Disclaimer {
  id: string;
  type: string;
  title: string;
  content: string;
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
  tags?: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: Date;
  created_by: string;
  assigned_to?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Post {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  attachments?: {
    type: string;
    url: string;
  }[];
}

export interface CareRecipient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  care_needs: string[];
  special_requirements: string[];
  medical_conditions: string[];
  allergies: string[];
  emergency_contacts: any[];
}

export interface CareUpdate {
  id: string;
  content: string;
  update_type: string;
  created_at: string;
  author_id?: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}
