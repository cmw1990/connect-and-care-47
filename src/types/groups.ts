export interface CareGroup {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  member_count: number;
  is_owner?: boolean;
  is_public?: boolean;
  location?: string;
  privacy_settings?: {
    visibility: 'public' | 'private';
    status?: 'normal' | 'warning' | 'urgent' | 'emergency';
    lastUpdated?: string;
  };
}

export interface GroupPrivacySettings {
  visibility: 'public' | 'private';
}

export interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  role: string;
  member_type?: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}