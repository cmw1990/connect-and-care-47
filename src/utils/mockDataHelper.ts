
import { UserProfile, Message, Connection, CareRecipient, Post, Task, CareUpdate, Document } from '@/types';

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
