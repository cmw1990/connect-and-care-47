
export interface CareTask {
  id: string;
  team_id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'high' | 'medium' | 'low' | 'urgent';
  status: 'pending' | 'inProgress' | 'completed';
  assigned_to?: string;
  due_date?: Date;
  completion_notes?: string;
  completed_at?: Date;
  completed_by?: string;
  recurring: boolean;
  recurrence_pattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    end_after?: number;
    end_date?: Date;
  };
  created_by: string;
  created_at?: string;
  updated_at?: string;
}
