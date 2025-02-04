export interface CareGroup {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_count?: number;
  is_owner?: boolean;
  is_public?: boolean;
  location?: string;
  privacy_settings?: GroupPrivacySettings | null;
}

export interface GroupPrivacySettings {
  visibility?: 'public' | 'private';
  status?: 'normal' | 'warning' | 'urgent' | 'emergency';
  lastUpdated?: string;
}