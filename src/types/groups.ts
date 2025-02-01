export interface CareGroup {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_count?: number;
  is_owner?: boolean;
  is_public?: boolean;
}