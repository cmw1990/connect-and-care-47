import { supabase } from '@/lib/supabase/client';
import { Tables } from '@/types/database.types';
import { analyticsService } from './analytics.service';
import { notificationService } from './notification.service';
import { fileService } from './file.service';

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'video' | 'audio' | 'system';
  attachments?: {
    id: string;
    type: string;
    url: string;
    name: string;
    size: number;
  }[];
  metadata?: Record<string, any>;
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
  updatedAt: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'care_team' | 'support_group';
  members: string[];
  avatar?: string;
  metadata?: Record<string, any>;
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface Translation {
  text: string;
  from: string;
  to: string;
  translated: string;
}

class CommunicationService {
  private messageSubscriptions: Map<string, () => void> = new Map();

  async sendMessage(message: Omit<Message, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Message> {
    // Handle file attachments first if any
    let attachments;
    if (message.attachments?.length) {
      attachments = await Promise.all(
        message.attachments.map(async (attachment) => {
          const response = await fetch(attachment.url);
          const blob = await response.blob();
          const file = new File([blob], attachment.name, { type: attachment.type });
          
          const fileMetadata = await fileService.uploadFile(file, 'message', {
            senderId: message.senderId,
            receiverId: message.receiverId,
            groupId: message.groupId,
          });

          return {
            id: fileMetadata.id,
            type: fileMetadata.type,
            url: fileMetadata.url,
            name: fileMetadata.name,
            size: fileMetadata.size,
          };
        })
      );
    }

    // Insert message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: message.senderId,
        receiver_id: message.receiverId,
        group_id: message.groupId,
        content: message.content,
        type: message.type,
        attachments,
        metadata: message.metadata,
        status: 'sent',
      })
      .select()
      .single();

    if (error) throw error;

    // Notify recipients
    if (message.receiverId) {
      await notificationService.create({
        userId: message.receiverId,
        type: 'message',
        title: 'New Message',
        message: message.content,
        data: { messageId: data.id },
      });
    } else if (message.groupId) {
      const { data: group } = await supabase
        .from('chat_groups')
        .select('members')
        .eq('id', message.groupId)
        .single();

      for (const memberId of group.members) {
        if (memberId !== message.senderId) {
          await notificationService.create({
            userId: memberId,
            type: 'message',
            title: 'New Group Message',
            message: message.content,
            data: { messageId: data.id, groupId: message.groupId },
          });
        }
      }
    }

    analyticsService.trackEvent({
      category: 'communication',
      action: 'send_message',
      label: message.type,
      metadata: {
        senderId: message.senderId,
        receiverId: message.receiverId,
        groupId: message.groupId,
      },
    });

    return data;
  }

  async getMessages(params: {
    senderId?: string;
    receiverId?: string;
    groupId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    messages: Message[];
    total: number;
    hasMore: boolean;
  }> {
    const limit = params.limit || 50;
    const offset = params.offset || 0;

    let query = supabase
      .from('messages')
      .select('*', { count: 'exact' });

    if (params.senderId) {
      query = query.eq('sender_id', params.senderId);
    }

    if (params.receiverId) {
      query = query.eq('receiver_id', params.receiverId);
    }

    if (params.groupId) {
      query = query.eq('group_id', params.groupId);
    }

    if (params.startDate) {
      query = query.gte('created_at', params.startDate);
    }

    if (params.endDate) {
      query = query.lte('created_at', params.endDate);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      messages: data,
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    };
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({
        status: 'read',
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    if (error) throw error;
  }

  async createChatGroup(group: Omit<ChatGroup, 'id' | 'lastMessage' | 'createdAt' | 'updatedAt'>): Promise<ChatGroup> {
    const { data, error } = await supabase
      .from('chat_groups')
      .insert({
        name: group.name,
        type: group.type,
        members: group.members,
        avatar: group.avatar,
        metadata: group.metadata,
      })
      .select()
      .single();

    if (error) throw error;

    // Notify members
    for (const memberId of group.members) {
      await notificationService.create({
        userId: memberId,
        type: 'group',
        title: 'Added to Chat Group',
        message: `You have been added to ${group.name}`,
        data: { groupId: data.id },
      });
    }

    analyticsService.trackEvent({
      category: 'communication',
      action: 'create_group',
      label: group.type,
      metadata: { members: group.members.length },
    });

    return data;
  }

  async getChatGroups(userId: string): Promise<ChatGroup[]> {
    const { data, error } = await supabase
      .from('chat_groups')
      .select(`
        *,
        last_message:messages(
          *
        )
      `)
      .contains('members', [userId])
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return data.map(group => ({
      ...group,
      lastMessage: group.last_message?.[0],
    }));
  }

  async addGroupMembers(groupId: string, memberIds: string[]): Promise<void> {
    const { data: group, error: groupError } = await supabase
      .from('chat_groups')
      .select('members')
      .eq('id', groupId)
      .single();

    if (groupError) throw groupError;

    const updatedMembers = [...new Set([...group.members, ...memberIds])];

    const { error } = await supabase
      .from('chat_groups')
      .update({
        members: updatedMembers,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId);

    if (error) throw error;

    // Notify new members
    for (const memberId of memberIds) {
      await notificationService.create({
        userId: memberId,
        type: 'group',
        title: 'Added to Chat Group',
        message: `You have been added to a chat group`,
        data: { groupId },
      });
    }
  }

  async removeGroupMembers(groupId: string, memberIds: string[]): Promise<void> {
    const { data: group, error: groupError } = await supabase
      .from('chat_groups')
      .select('members')
      .eq('id', groupId)
      .single();

    if (groupError) throw groupError;

    const updatedMembers = group.members.filter(id => !memberIds.includes(id));

    const { error } = await supabase
      .from('chat_groups')
      .update({
        members: updatedMembers,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId);

    if (error) throw error;

    // Notify removed members
    for (const memberId of memberIds) {
      await notificationService.create({
        userId: memberId,
        type: 'group',
        title: 'Removed from Chat Group',
        message: `You have been removed from a chat group`,
        data: { groupId },
      });
    }
  }

  async subscribeToMessages(params: {
    userId: string;
    groupId?: string;
    onMessage: (message: Message) => void;
  }): Promise<() => void> {
    const { userId, groupId, onMessage } = params;

    let subscription = supabase
      .channel(`messages:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: groupId
            ? `group_id=eq.${groupId}`
            : `receiver_id=eq.${userId}`,
        },
        (payload) => {
          onMessage(payload.new as Message);
        }
      )
      .subscribe();

    const unsubscribe = () => {
      subscription.unsubscribe();
    };

    this.messageSubscriptions.set(userId, unsubscribe);
    return unsubscribe;
  }

  async unsubscribeFromMessages(userId: string): Promise<void> {
    const unsubscribe = this.messageSubscriptions.get(userId);
    if (unsubscribe) {
      unsubscribe();
      this.messageSubscriptions.delete(userId);
    }
  }

  async translateMessage(params: {
    text: string;
    from: string;
    to: string;
  }): Promise<Translation> {
    // This is a placeholder - implement actual translation service
    // You might want to use a service like Google Translate API
    const translation: Translation = {
      text: params.text,
      from: params.from,
      to: params.to,
      translated: params.text, // Replace with actual translation
    };

    analyticsService.trackEvent({
      category: 'communication',
      action: 'translate_message',
      label: `${params.from}_to_${params.to}`,
    });

    return translation;
  }
}

export const communicationService = new CommunicationService();
