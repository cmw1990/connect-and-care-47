
import { 
  UserProfile, 
  Message, 
  CareTask,
  Connection,
  Post,
  CareUpdate,
  Availability,
  Document,
  CompanionMatch,
  Disclaimer,
  LocationData
} from '@/types';

/**
 * Helper function to cast objects to desired types.
 * This is used to fix TypeScript errors when using mock data.
 */
export function typeCastObject<T>(obj: any): T {
  return obj as T;
}

/**
 * Create a mock user profile
 */
export function createMockUserProfile(partialProfile?: Partial<UserProfile>): UserProfile {
  return {
    id: `user-${Math.floor(Math.random() * 1000)}`,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    avatar_url: `https://avatar.vercel.sh/john${Math.floor(Math.random() * 100)}`,
    role: 'user',
    ...partialProfile
  };
}

/**
 * Create mock messages for chat
 */
export function createMockMessages(count: number = 5): Message[] {
  const messages: Message[] = [];
  const sender = createMockUserProfile();
  const recipient = createMockUserProfile({ 
    id: `user-${Math.floor(Math.random() * 1000)}`,
    first_name: 'Jane', 
    last_name: 'Smith'
  });
  
  for (let i = 0; i < count; i++) {
    const isFromSender = i % 2 === 0;
    messages.push({
      id: `msg-${i}`,
      content: `This is message #${i + 1}`,
      sender_id: isFromSender ? sender.id : recipient.id,
      created_at: new Date(Date.now() - (count - i) * 60000).toISOString(),
      sender: isFromSender ? sender : recipient,
      role: isFromSender ? 'user' : 'assistant'
    });
  }
  
  return messages;
}

/**
 * Create mock care tasks
 */
export function createMockCareTasks(count: number = 5): CareTask[] {
  const statuses: CareTask['status'][] = ['pending', 'in_progress', 'completed', 'cancelled'];
  const priorities: CareTask['priority'][] = ['high', 'medium', 'low', 'urgent'];
  const categories = ['medication', 'appointment', 'exercise', 'meal', 'social'];
  
  return Array(count).fill(null).map((_, i) => ({
    id: `task-${i}`,
    title: `Task ${i + 1}`,
    description: `Description for task ${i + 1}`,
    due_date: new Date(Date.now() + i * 86400000).toISOString(),
    status: statuses[i % statuses.length],
    priority: priorities[i % priorities.length],
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    team_id: 'team-1',
    category: categories[i % categories.length],
    recurring: i % 3 === 0,
  }));
}

/**
 * Create mock connections
 */
export function createMockConnections(count: number = 3): Connection[] {
  const connectionTypes: Array<'carer' | 'pal'> = ['carer', 'pal'];
  
  return Array(count).fill(null).map((_, i) => ({
    id: `connection-${i}`,
    requester_id: `user-${100 + i}`,
    recipient_id: `user-${200 + i}`,
    connection_type: connectionTypes[i % connectionTypes.length],
    status: i % 3 === 0 ? 'pending' : 'active',
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    updated_at: new Date(Date.now() - i * 43200000).toISOString(),
    requester: createMockUserProfile({ id: `user-${100 + i}` }),
    recipient: createMockUserProfile({ id: `user-${200 + i}` })
  }));
}

/**
 * Create mock posts
 */
export function createMockPosts(count: number = 5): Post[] {
  return Array(count).fill(null).map((_, i) => ({
    id: `post-${i}`,
    content: `This is post #${i + 1} with some content.`,
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    created_by: `user-${i}`,
    author: createMockUserProfile({ id: `user-${i}` })
  }));
}

/**
 * Create mock care updates
 */
export function createMockCareUpdates(count: number = 5): CareUpdate[] {
  const updateTypes = ['status', 'medication', 'mood', 'activity'];
  
  return Array(count).fill(null).map((_, i) => ({
    id: `update-${i}`,
    content: `Care update #${i + 1}: ${updateTypes[i % updateTypes.length]} update`,
    update_type: updateTypes[i % updateTypes.length],
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    author_id: `user-${i}`,
    author: createMockUserProfile({ id: `user-${i}` })
  }));
}

/**
 * Create mock availability
 */
export function createMockAvailability(count: number = 7): Availability[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return days.map((day, i) => ({
    id: `avail-${i}`,
    user_id: `user-${i % 3}`,
    available_days: [day],
    available_hours: {
      start: '09:00',
      end: '17:00'
    }
  }));
}

/**
 * Create mock documents
 */
export function createMockDocuments(count: number = 5): Document[] {
  const docTypes = ['medical', 'invoice', 'consent', 'report', 'prescription'];
  
  return Array(count).fill(null).map((_, i) => ({
    id: `doc-${i}`,
    title: `Document ${i + 1}`,
    description: `Description for document ${i + 1}`,
    file_url: `https://example.com/docs/file-${i}.pdf`,
    document_type: docTypes[i % docTypes.length],
    created_by: `user-${i % 3}`,
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    updated_at: new Date(Date.now() - i * 43200000).toISOString()
  }));
}

/**
 * Create mock companion matches
 */
export function createMockCompanionMatches(count: number = 5): CompanionMatch[] {
  const areas = ['Dementia Care', 'Elderly Companionship', 'Memory Support', 'Recreational Activities'];
  const languages = ['English', 'Spanish', 'French', 'Mandarin', 'Arabic'];
  
  return Array(count).fill(null).map((_, i) => ({
    id: `companion-${i}`,
    user: {
      first_name: `Companion ${i + 1}`,
      last_name: 'Smith'
    },
    expertise_areas: [areas[i % areas.length]],
    dementia_experience: i % 2 === 0,
    communication_preferences: ['In-person', 'Video', 'Phone'].slice(0, (i % 3) + 1),
    languages: [languages[i % languages.length]],
    virtual_meeting_preference: i % 3 !== 0,
    in_person_meeting_preference: i % 2 === 0,
    rating: 3 + (i % 3),
    hourly_rate: 25 + (i * 5),
    identity_verified: i % 3 === 0,
    mental_health_specialties: ['Anxiety', 'Depression'].slice(0, (i % 2) + 1),
    support_tools_proficiency: {},
    virtual_meeting_tools: ['Zoom', 'Teams'].slice(0, (i % 2) + 1),
    cognitive_engagement_activities: {
      memory_games: ['Matching', 'Puzzles'],
      brain_teasers: ['Riddles']
    },
    interests: ['Reading', 'Music', 'Art', 'Gardening'].slice(0, (i % 4) + 1)
  }));
}

/**
 * Create mock disclaimers
 */
export function createMockDisclaimers(count: number = 3): Disclaimer[] {
  const types = ['legal', 'privacy', 'medical'];
  const titles = [
    'Terms of Service', 
    'Privacy Policy', 
    'Medical Disclaimer', 
    'Data Processing', 
    'User Agreement'
  ];
  
  return Array(count).fill(null).map((_, i) => ({
    id: `disclaimer-${i}`,
    type: types[i % types.length],
    title: titles[i % titles.length],
    content: `This is a ${types[i % types.length]} disclaimer. ${titles[i % titles.length]} content goes here.`,
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    updated_at: new Date(Date.now() - i * 43200000).toISOString()
  }));
}

/**
 * Create mock location data
 */
export function createMockLocationData(): LocationData {
  return {
    latitude: 37.7749,
    longitude: -122.4194,
    address: '123 Main St, San Francisco, CA 94105'
  };
}
