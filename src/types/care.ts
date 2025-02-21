export type CareRecipientType = 
  | 'elderly'
  | 'child'
  | 'adult'
  | 'pet'
  | 'partner'
  | 'family_member'
  | 'friend';

export type SpecializedCondition =
  | 'dementia'
  | 'alzheimers'
  | 'parkinsons'
  | 'diabetes'
  | 'heart_disease'
  | 'stroke'
  | 'cancer'
  | 'mental_health'
  | 'addiction'
  | 'physical_disability'
  | 'developmental_disability'
  | 'chronic_pain'
  | 'respiratory_disease'
  | 'arthritis'
  | 'vision_impairment'
  | 'hearing_impairment'
  | 'autism'
  | 'adhd'
  | 'special_needs'
  | 'post_surgery'
  | 'pregnancy'
  | 'postpartum';

export interface CareProfile {
  id: string;
  name: string;
  recipient_type: CareRecipientType;
  specialized_conditions: SpecializedCondition[];
  age_group: string;
  care_needs: Record<string, any>;
  emergency_contacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address?: string;
    is_primary: boolean;
  }>;
  medical_history: {
    conditions: string[];
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      instructions: string;
    }>;
    allergies: string[];
    procedures: Array<{
      name: string;
      date: string;
      notes: string;
    }>;
  };
  care_preferences: {
    communication: string[];
    schedule: Record<string, any>;
    dietary: string[];
    activities: string[];
    environment: Record<string, any>;
  };
  dietary_restrictions: string[];
  allergies: string[];
  mobility_status: string;
  communication_preferences: {
    preferred_language: string;
    communication_methods: string[];
    special_instructions: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CareResource {
  id: string;
  condition: SpecializedCondition;
  title: string;
  description: string;
  content_type: string;
  content: Record<string, any>;
  metadata: Record<string, any>;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CareTip {
  id: string;
  recipient_type: CareRecipientType;
  condition: SpecializedCondition;
  title: string;
  content: string;
  category: string;
  difficulty_level: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CareTool {
  id: string;
  name: string;
  description: string;
  tool_type: string;
  recipient_types: CareRecipientType[];
  conditions: SpecializedCondition[];
  configuration: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CareAssessment {
  id: string;
  title: string;
  description: string;
  recipient_type: CareRecipientType;
  condition: SpecializedCondition;
  questions: Array<{
    id: string;
    text: string;
    type: string;
    options?: string[];
    required: boolean;
  }>;
  scoring_logic: Record<string, any>;
  recommendations: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CareProgress {
  id: string;
  profile_id: string;
  assessment_id: string;
  metrics: Record<string, any>;
  notes: string;
  recorded_at: string;
  recorded_by: string;
  created_at: string;
}

export interface PetProfile {
  id: string;
  care_profile_id: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  medical_history: Record<string, any>;
  vaccination_records: Array<{
    type: string;
    date: string;
    due_date: string;
    veterinarian: string;
  }>;
  dietary_needs: string[];
  exercise_needs: string;
  behavioral_notes: string;
  grooming_needs: string[];
  veterinarian_info: {
    name: string;
    clinic: string;
    phone: string;
    email?: string;
    address: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ChildProfile {
  id: string;
  care_profile_id: string;
  age: number;
  grade: string;
  school_info: {
    name: string;
    address: string;
    phone: string;
    teacher: string;
    schedule: Record<string, any>;
  };
  activities: string[];
  developmental_notes: string;
  educational_needs: string[];
  behavioral_notes: string;
  medical_needs: Record<string, any>;
  dietary_needs: string[];
  schedule: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ConditionCarePlan {
  id: string;
  profile_id: string;
  condition: SpecializedCondition;
  care_plan: {
    goals: string[];
    interventions: string[];
    monitoring: Record<string, any>;
    schedule: Record<string, any>;
  };
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    instructions: string;
    side_effects: string[];
  }>;
  treatments: Array<{
    type: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  monitoring_requirements: Array<{
    type: string;
    frequency: string;
    target_values: Record<string, any>;
    instructions: string;
  }>;
  emergency_procedures: {
    conditions: string[];
    steps: string[];
    contacts: Array<{
      name: string;
      role: string;
      phone: string;
    }>;
  };
  specialist_contacts: Array<{
    name: string;
    specialty: string;
    phone: string;
    email?: string;
    address: string;
    notes: string;
  }>;
  progress_metrics: Record<string, any>;
  created_at: string;
  updated_at: string;
}
