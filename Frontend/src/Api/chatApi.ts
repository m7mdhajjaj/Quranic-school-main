import api from './api';

// ============================================================================
// Chat API
// ============================================================================

export interface Message {
  _id?: string;
  sender: string;
  receiver?: string;
  group?: string;
  content: string;
  timestamp: Date | string;
  isRead?: boolean;
  senderInfo?: {
    firstName: string;
    lastName?: string;
    role: string;
  };
}

export interface Conversation {
  _id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount?: number;
  conversationType: 'private' | 'group';
  groupInfo?: {
    name: string;
    description?: string;
  };
}

// Get conversations
export const getConversations = async (): Promise<Conversation[]> => {
  const response = await api.get('/chat/conversations');
  return response.data;
};

// Get messages
export const getMessages = async (params: {
  conversationId?: string;
  userId?: string;
  groupId?: string;
  page?: number;
  limit?: number;
}): Promise<{ messages: Message[]; total: number; page: number; totalPages: number }> => {
  const response = await api.get('/chat/messages', { params });
  return response.data;
};

// Send message
export const sendMessage = async (data: {
  receiver?: string;
  group?: string;
  content: string;
}): Promise<Message> => {
  const response = await api.post('/chat/messages', data);
  return response.data;
};

// Mark messages as read
export const markMessagesAsRead = async (messageIds: string[]): Promise<void> => {
  await api.put('/chat/messages/read', { messageIds });
};

// Get unread count
export const getUnreadCount = async (): Promise<{ count: number }> => {
  const response = await api.get('/chat/unread-count');
  return response.data;
};

// Delete message
export const deleteMessage = async (messageId: string): Promise<void> => {
  await api.delete(`/chat/messages/${messageId}`);
};

// Create group conversation
export const createGroupConversation = async (data: {
  name: string;
  description?: string;
  participants: string[];
}): Promise<Conversation> => {
  const response = await api.post('/chat/groups', data);
  return response.data;
};

// Add participants to group
export const addParticipants = async (conversationId: string, participants: string[]): Promise<Conversation> => {
  const response = await api.post(`/chat/groups/${conversationId}/participants`, { participants });
  return response.data;
};

// Remove participant from group
export const removeParticipant = async (conversationId: string, participantId: string): Promise<Conversation> => {
  const response = await api.delete(`/chat/groups/${conversationId}/participants/${participantId}`);
  return response.data;
};