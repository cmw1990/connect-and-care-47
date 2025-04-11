
import { UserProfile, Message, Connection, CareRecipient, Post, Task, CareUpdate, Document, Disclaimer, CareTask } from '@/types';

export function createMockUserProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: `user-${Math.floor(Math.random() * 1000)}`,
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    avatar_url: 'https://avatar.vercel.sh/jane-smith',
    role: 'patient',
    ...overrides
  };
}

export function createMockMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: `msg-${Math.floor(Math.random() * 1000)}`,
    content: 'This is a sample message',
    sender_id: 'user-123',
    created_at: new Date().toISOString(),
    sender: createMockUserProfile({ id: 'user-123' }),
    ...overrides
  };
}

export function createMockMessages(count: number, overrides: Partial<Message> = {}): Message[] {
  return Array(count).fill(null).map((_, index) => 
    createMockMessage({ 
      id: `msg-${index}`, 
      content: `This is sample message ${index + 1}`,
      ...overrides 
    })
  );
}

export function createMockConnection(overrides: Partial<Connection> = {}): Connection {
  return {
    id: `conn-${Math.floor(Math.random() * 1000)}`,
    requester_id: 'user-123',
    recipient_id: 'user-456',
    connection_type: 'carer',
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    requester: createMockUserProfile({ id: 'user-123' }),
    recipient: createMockUserProfile({ id: 'user-456' }),
    ...overrides
  };
}

export function createMockPost(overrides: Partial<Post> = {}): Post {
  return {
    id: `post-${Math.floor(Math.random() * 1000)}`,
    content: 'This is a sample post content',
    created_at: new Date().toISOString(),
    created_by: 'user-123',
    author: createMockUserProfile({ id: 'user-123' }),
    ...overrides
  };
}

export function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: `task-${Math.floor(Math.random() * 1000)}`,
    title: 'Sample Task',
    due_date: new Date().toISOString(),
    status: 'pending',
    priority: 'medium',
    group_id: 'group-123',
    ...overrides
  };
}

export function createMockCareTask(overrides: Partial<CareTask> = {}): CareTask {
  return {
    id: `task-${Math.floor(Math.random() * 1000)}`,
    title: 'Sample Care Task',
    description: 'Description of the care task',
    due_date: new Date().toISOString(),
    status: 'pending',
    priority: 'medium',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    completed_by: null,
    team_id: 'team-123',
    created_by: 'user-123',
    assigned_to: 'user-456',
    category: 'medication',
    recurrence_pattern: null,
    recurring: false,
    ...overrides
  };
}

export function createMockCareTasks(count: number, overrides: Partial<CareTask> = {}): CareTask[] {
  return Array(count).fill(null).map((_, index) => 
    createMockCareTask({ 
      id: `task-${index}`, 
      title: `Sample Task ${index + 1}`,
      ...overrides 
    })
  );
}

export function createMockCareUpdate(overrides: Partial<CareUpdate> = {}): CareUpdate {
  return {
    id: `update-${Math.floor(Math.random() * 1000)}`,
    content: 'This is a care update',
    update_type: 'medication',
    created_at: new Date().toISOString(),
    author_id: 'user-123',
    author: createMockUserProfile({ id: 'user-123' }),
    ...overrides
  };
}

export function createMockDocument(overrides: Partial<Document> = {}): Document {
  return {
    id: `doc-${Math.floor(Math.random() * 1000)}`,
    title: 'Sample Document',
    description: 'This is a sample document',
    file_url: 'https://example.com/sample.pdf',
    document_type: 'medical',
    created_by: 'user-123',
    created_at: new Date().toISOString(),
    ...overrides
  };
}

export function createMockCareRecipient(overrides: Partial<CareRecipient> = {}): CareRecipient {
  return {
    id: `recipient-${Math.floor(Math.random() * 1000)}`,
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1950-01-01',
    care_needs: ['medication management', 'mobility assistance'],
    ...overrides
  };
}

export function createMockDisclaimers(count: number): Disclaimer[] {
  const types = ['medical', 'privacy', 'terms', 'legal'];
  
  return Array(count).fill(null).map((_, index) => ({
    id: `disclaimer-${index}`,
    type: types[index % types.length],
    title: `Sample ${types[index % types.length]} Disclaimer`,
    content: 'This is a sample disclaimer content. Please read carefully before proceeding.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

// Utility function to help with type conversion from API data
export function typeCastObject<T>(obj: any): T {
  return obj as T;
}

