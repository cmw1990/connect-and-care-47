export interface CaregiverProfile {
  id: string;
  name: string;
  bio: string;
  location: string;
  specialties: string[];
  availability: string[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  yearsOfExperience: number;
  languages: string[];
  certifications: string[];
  backgroundCheck: boolean;
  lastActive: string;
  created_at: string;
  updated_at: string;
}
