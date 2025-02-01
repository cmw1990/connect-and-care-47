export interface CareGroup {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_count?: number;
}