export interface CareHomeMetric {
  id: string;
  facility_id: string;
  metric_type: string;
  metric_value: any;
  recorded_at: string;
}

export interface CareHomeResource {
  id: string;
  facility_id: string;
  resource_type: string;
  resource_name: string;
  quantity: number;
  unit: string;
  minimum_threshold: number;
  status?: string;
  last_restocked?: string;
  notes?: string;
}

export interface CareHomeStaffSchedule {
  id: string;
  facility_id: string;
  staff_id: string;
  shift_start: string;
  shift_end: string;
  shift_type: string;
  department: string;
  status?: string;
  notes?: string;
}