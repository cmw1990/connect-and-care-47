
import { supabase } from "@/integrations/supabase/client";
import { PostgrestFilterBuilder, PostgrestSingleResponse } from "@supabase/supabase-js";
import { createMockProfile } from "@/utils/supabaseHelpers";
import { 
  Message, CareTask, Availability, Connection, 
  Post, Task, CareUpdate, Document, 
  CareRecipient, Disclaimer, UserProfile, 
  CompanionMatch, LocationData
} from "@/types";

/**
 * Helper function to create mock data for a component that's trying to query a non-existent table
 * This prevents type errors when components expect data from Supabase
 */
export function createMockQuery<T>(mockData: T[]): {
  eq: () => { 
    order: () => { 
      select: () => Promise<PostgrestSingleResponse<T[]>>
    } 
  }
} {
  return {
    eq: () => ({ 
      order: () => ({
        select: async () => ({ 
          data: mockData, 
          error: null, 
          count: mockData.length, 
          status: 200,
          statusText: 'OK' 
        })
      })
    })
  };
}

/**
 * Provides a safe mock implementation for database queries that can't be found
 * @param mockData Data to return for the query
 */
export function mockSupabaseFrom<T>(mockData: T[]) {
  return {
    select: () => ({
      eq: () => ({
        order: () => ({
          limit: () => ({
            then: (callback: (result: PostgrestSingleResponse<T[]>) => void) => {
              callback({
                data: mockData,
                error: null,
                count: mockData.length,
                status: 200,
                statusText: 'OK'
              });
              return Promise.resolve();
            }
          })
        })
      })
    }),
    insert: () => ({
      select: () => Promise.resolve({
        data: mockData,
        error: null,
        count: mockData.length,
        status: 201,
        statusText: 'Created'
      })
    }),
    update: () => ({
      eq: () => Promise.resolve({
        data: mockData,
        error: null,
        count: mockData.length,
        status: 200,
        statusText: 'OK'
      })
    }),
    delete: () => ({
      eq: () => Promise.resolve({
        data: [],
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK'
      })
    })
  };
}

/**
 * Creates mock UserProfile data for components that expect sender/receiver profiles
 */
export function createMockUserProfile(): UserProfile {
  return {
    id: "user-mock-" + Math.random().toString(36).substring(2, 10),
    first_name: "Mock",
    last_name: "User"
  };
}

/**
 * Creates mock Message data with proper UserProfile structure
 */
export function createMockMessages(count: number = 3): Message[] {
  return Array(count).fill(null).map((_, index) => ({
    id: `msg-${index}`,
    content: `This is a mock message ${index + 1}`,
    sender_id: `user-${index % 2 + 1}`,
    created_at: new Date(Date.now() - index * 60000).toISOString(),
    sender: {
      id: `user-${index % 2 + 1}`,
      first_name: index % 2 === 0 ? "John" : "Jane",
      last_name: "Doe"
    },
    role: index % 2 === 0 ? "user" : "assistant" 
  }));
}

/**
 * Creates mock CareTask data
 */
export function createMockTasks(count: number = 5): CareTask[] {
  const statuses: ("pending" | "in_progress" | "completed" | "cancelled")[] = ["pending", "in_progress", "completed", "cancelled"];
  const priorities: ("high" | "medium" | "low" | "urgent")[] = ["high", "medium", "low", "urgent"];
  const categories = ["medication", "appointment", "exercise", "social", "household"];
  
  return Array(count).fill(null).map((_, index) => ({
    id: `task-${index}`,
    title: `Task ${index + 1}`,
    description: `Description for task ${index + 1}`,
    due_date: new Date(Date.now() + (index + 1) * 86400000).toISOString(),
    status: statuses[index % statuses.length],
    priority: priorities[index % priorities.length],
    category: categories[index % categories.length],
    team_id: "team-1",
    created_by: "user-1",
    assigned_to: index % 2 === 0 ? "user-2" : undefined,
    created_at: new Date(Date.now() - index * 86400000).toISOString(),
    completed_at: statuses[index % statuses.length] === "completed" ? new Date().toISOString() : null,
    completed_by: statuses[index % statuses.length] === "completed" ? "user-2" : null,
    recurring: index % 3 === 0
  }));
}

/**
 * Creates mock Connection data
 */
export function createMockConnections(count: number = 3): Connection[] {
  const types: ("carer" | "pal")[] = ["carer", "pal"];
  const statuses = ["pending", "accepted", "declined"];
  
  return Array(count).fill(null).map((_, index) => ({
    id: `connection-${index}`,
    requester_id: `user-1`,
    recipient_id: `user-${index + 2}`,
    connection_type: types[index % types.length],
    status: statuses[index % statuses.length],
    created_at: new Date(Date.now() - index * 86400000).toISOString(),
    updated_at: new Date(Date.now() - index * 43200000).toISOString(),
    requester: {
      id: "user-1",
      first_name: "John",
      last_name: "Doe"
    },
    recipient: {
      id: `user-${index + 2}`,
      first_name: `Recipient`,
      last_name: `${index + 1}`
    }
  }));
}

/**
 * Creates mock Availability data
 */
export function createMockAvailability(count: number = 3): Availability[] {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  
  return Array(count).fill(null).map((_, index) => ({
    id: `availability-${index}`,
    user_id: `user-${index + 1}`,
    available_days: days.slice(0, 5),
    available_hours: {
      monday: ["09:00", "17:00"],
      tuesday: ["09:00", "17:00"],
      wednesday: ["09:00", "17:00"],
      thursday: ["09:00", "17:00"],
      friday: ["09:00", "17:00"]
    }
  }));
}

/**
 * Creates mock Post data
 */
export function createMockPosts(count: number = 3): Post[] {
  return Array(count).fill(null).map((_, index) => ({
    id: `post-${index}`,
    content: `This is a mock post ${index + 1}`,
    created_at: new Date(Date.now() - index * 86400000).toISOString(),
    created_by: `user-${index % 2 + 1}`,
    author: {
      id: `user-${index % 2 + 1}`,
      first_name: index % 2 === 0 ? "John" : "Jane",
      last_name: "Doe"
    }
  }));
}

/**
 * Creates mock Task data
 */
export function createMockGroupTasks(count: number = 3): Task[] {
  const statuses = ["pending", "in_progress", "completed"];
  const priorities = ["high", "medium", "low"];
  
  return Array(count).fill(null).map((_, index) => ({
    id: `task-${index}`,
    title: `Task ${index + 1}`,
    due_date: new Date(Date.now() + (index + 1) * 86400000).toISOString(),
    status: statuses[index % statuses.length],
    priority: priorities[index % priorities.length],
    group_id: "group-1"
  }));
}

/**
 * Creates mock CareUpdate data
 */
export function createMockCareUpdates(count: number = 3): CareUpdate[] {
  const types = ["health", "social", "medication", "appointment"];
  
  return Array(count).fill(null).map((_, index) => ({
    id: `update-${index}`,
    content: `Update content ${index + 1}`,
    update_type: types[index % types.length],
    created_at: new Date(Date.now() - index * 86400000).toISOString(),
    author_id: `user-${index % 2 + 1}`,
    author: {
      id: `user-${index % 2 + 1}`,
      first_name: index % 2 === 0 ? "John" : "Jane",
      last_name: "Doe"
    }
  }));
}

/**
 * Creates mock CareRecipient data
 */
export function createMockCareRecipients(count: number = 2): CareRecipient[] {
  return Array(count).fill(null).map((_, index) => ({
    id: `recipient-${index}`,
    first_name: `Patient`,
    last_name: `${index + 1}`,
    date_of_birth: new Date(Date.now() - (70 + index) * 365 * 86400000).toISOString().split('T')[0],
    care_needs: ["medication_reminders", "mobility_assistance", "meal_preparation"],
    special_requirements: index % 2 === 0 ? ["allergies", "dietary_restrictions"] : undefined,
    medical_conditions: ["hypertension", "arthritis"],
    emergency_contacts: [
      { name: "Emergency Contact 1", phone: "123-456-7890", relationship: "Son" }
    ],
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 86400000).toISOString()
  }));
}

/**
 * Creates mock Document data
 */
export function createMockDocuments(count: number = 3): Document[] {
  const types = ["medical", "financial", "legal", "personal"];
  
  return Array(count).fill(null).map((_, index) => ({
    id: `document-${index}`,
    title: `Document ${index + 1}`,
    description: `Description for document ${index + 1}`,
    file_url: `/mock-documents/doc${index + 1}.pdf`,
    document_type: types[index % types.length],
    created_by: `user-${index % 2 + 1}`,
    created_at: new Date(Date.now() - index * 86400000).toISOString(),
    updated_at: new Date(Date.now() - index * 43200000).toISOString()
  }));
}

/**
 * Creates mock Disclaimer data
 */
export function createMockDisclaimers(count: number = 3): Disclaimer[] {
  const types = ["legal", "privacy", "terms", "platform_disclaimer"];
  
  return Array(count).fill(null).map((_, index) => ({
    id: `disclaimer-${index}`,
    type: types[index % types.length],
    title: `${types[index % types.length].charAt(0).toUpperCase() + types[index % types.length].slice(1)} Disclaimer`,
    content: `This is the content for the ${types[index % types.length]} disclaimer.`,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 86400000).toISOString()
  }));
}

/**
 * Creates mock CompanionMatch data
 */
export function createMockCompanionMatches(count: number = 3): CompanionMatch[] {
  return Array(count).fill(null).map((_, index) => ({
    id: `companion-${index}`,
    user: {
      first_name: `Companion`,
      last_name: `${index + 1}`
    },
    expertise_areas: ["dementia", "elderly_care", "mobility_assistance"],
    dementia_experience: index % 2 === 0,
    communication_preferences: ["in_person", "video", "phone"],
    languages: ["English", "Spanish"],
    virtual_meeting_preference: true,
    in_person_meeting_preference: index % 2 === 0,
    rating: 4 + Math.random(),
    hourly_rate: 25 + index * 5,
    identity_verified: true,
    mental_health_specialties: ["anxiety", "depression"],
    support_tools_proficiency: {
      digital_apps: true,
      monitoring_devices: index % 2 === 0
    },
    virtual_meeting_tools: ["zoom", "skype", "facetime"],
    interests: ["reading", "gardening", "music"],
    cognitive_engagement_activities: {
      memory_games: ["puzzles", "word games"],
      brain_teasers: ["riddles", "logic problems"],
      social_activities: ["conversation", "storytelling"],
      creative_exercises: ["drawing", "crafts"]
    }
  }));
}

/**
 * Creates a typecast wrapper to properly cast objects to expected types
 */
export function typeCastObject<T>(obj: any): T {
  return obj as unknown as T;
}

/**
 * Helper to mock Supabase responses for components expecting database data
 */
export function mockSupabaseResponse<T>(mockData: T[]): any {
  return {
    from: () => mockSupabaseFrom(mockData),
    query: createMockQuery(mockData)
  };
}
