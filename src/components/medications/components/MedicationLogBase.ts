
import { MedicationSchedule } from "@/types/database.types";

export interface MedicationLogBase {
  id: string;
  schedule_id: string;
  taken_at: string;
  administered_at: string;
  status: 'taken' | 'missed' | 'pending' | 'pending_verification' | 'rejected';
  administered_by?: string;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  photo_verification_url?: string;
  medication_schedule?: MedicationSchedule;
}

// Empty mock implementation to use when relation queries fail
export const createMockMedicationLog = (): MedicationLogBase => ({
  id: '',
  schedule_id: '',
  taken_at: new Date().toISOString(),
  administered_at: new Date().toISOString(),
  status: 'pending',
  medication_schedule: {
    id: '',
    medication_name: 'Unknown Medication',
    dosage: 'Unknown dosage',
    frequency: 'daily',
    time_of_day: [],
    group_id: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    instructions: '',
    start_date: '',
    end_date: ''
  }
});
