import api from './api';

// ============================================================================
// Chat API - Updated to match Backend API structure
// ============================================================================

// Types matching Backend schemas
export type ChatType = 'DM' | 'GROUP';
export type UserModel = 'Student' | 'Teacher' | 'Admin' | 'Secretary' | 'TeacherAssistant';

export interface UserInfo {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: { url: string };
}

export interface Participant {
  userId: UserInfo;
  userModel: UserModel;
  mutedUntil?: string;
}

export interface GroupInfo {
  _id: string;
  name: string;
  description?: string;
  image?: { url: string };
}

export interface Message {
  _id: string;
  chatType: ChatType;
  sender: UserInfo;
  senderModel?: UserModel;
  recipient?: string;
  recipientModel?: UserModel;
  groupId?: string;
  text?: string;
  attachments?: Array<{
    url: string;
    type: 'image' | 'file' | 'audio';
    name?: string;
    size?: number;
  }>;
  replyTo?: {
    _id: string;
    text: string;
    sender: UserInfo;
  };
  mentions?: Array<{
    type: 'user' | 'all';
    user?: UserInfo;
  }>;
  deliveredAt?: string;
  readAt?: string;
  deliveredTo?: Array<{ userId: string; at: string }>;
  seenBy?: Array<{ userId: string; at: string }>;
  edited?: boolean;
  editedAt?: string;
  deletedFor?: string[];
  deletedForAll?: boolean;
  createdAt: string;
  clientTempId?: string;
}

export interface Conversation {
  _id: string;
  type: ChatType;
  participants: Participant[];
  groupId?: GroupInfo;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: { url: string };
  role: 'student' | 'teacher' | 'admin' | 'secretary' | 'teacherAssistant';
  studentId?: string;
  teacherId?: string;
  adminId?: string;
  secretaryId?: string;
  assistantId?: string;
  group?: string;
}

export interface ContactsResponse {
  contacts: Contact[];
  groups: GroupInfo[];
}

// ============================================================================
// Contacts & Groups
// ============================================================================

// Get contacts and groups for current user
export const getContacts = async (search?: string): Promise<ContactsResponse> => {
  const response = await api.get('/chat/contacts', { params: { search } });
  return response.data;
};

// Initialize group conversations (for teachers/admins)
export const initializeGroups = async (): Promise<{ success: boolean; initialized: number }> => {
  const response = await api.post('/chat/initialize-groups');
  return response.data;
};

// ============================================================================
// Conversations
// ============================================================================

// Get all conversations
export const getConversations = async (search?: string): Promise<Conversation[]> => {
  const response = await api.get('/chat/conversations', { params: { search } });
  return response.data;
};

// Reset unread count
export const resetUnreadCount = async (chatType: ChatType, targetId: string): Promise<{ success: boolean }> => {
  const response = await api.post('/chat/conversations/reset-unread', { chatType, targetId });
  return response.data;
};

// Mute conversation
export const muteConversation = async (
  chatType: ChatType, 
  targetId: string, 
  duration: number // in minutes, -1 for indefinitely, 0 to unmute
): Promise<{ success: boolean }> => {
  const response = await api.post('/chat/conversations/mute', { chatType, targetId, duration });
  return response.data;
};

// Delete conversation
export const deleteConversation = async (conversationId: string): Promise<{ success: boolean }> => {
  const response = await api.delete(`/chat/conversations/${conversationId}`);
  return response.data;
};

// ============================================================================
// Messages
// ============================================================================

// Get messages for a conversation
export const getMessages = async (params: {
  chatType: ChatType;
  targetId: string;
  limit?: number;
  before?: string;
}): Promise<Message[]> => {
  const response = await api.get('/chat/messages', { params });
  return response.data;
};

// Get message with context (surrounding messages)
export const getMessageContext = async (messageId: string): Promise<Message[]> => {
  const response = await api.get(`/chat/messages/${messageId}/context`);
  return response.data;
};

// Send message
export const sendMessage = async (data: {
  chatType: ChatType;
  recipientId?: string;
  groupId?: string;
  text?: string;
  attachments?: Array<{
    url: string;
    type: 'image' | 'file' | 'audio';
    name?: string;
    size?: number;
  }>;
  replyTo?: string;
  clientTempId?: string;
  mentions?: Array<{ type: 'user' | 'all'; user?: string }>;
}): Promise<Message> => {
  const response = await api.post('/chat/messages', data);
  return response.data;
};

// Mark message as seen
export const markMessageSeen = async (messageId: string, chatType: ChatType): Promise<{ success: boolean }> => {
  const response = await api.post('/chat/messages/seen', { messageId, chatType });
  return response.data;
};

// Edit message
export const editMessage = async (messageId: string, text: string): Promise<Message> => {
  const response = await api.patch(`/chat/messages/${messageId}`, { text });
  return response.data;
};

// Delete message
export const deleteMessage = async (
  messageId: string, 
  deleteForAll: boolean = false
): Promise<{ success: boolean }> => {
  const response = await api.delete(`/chat/messages/${messageId}`, { 
    data: { deleteForAll } 
  });
  return response.data;
};

// Upload attachment
export const uploadAttachment = async (file: File): Promise<{
  url: string;
  type: 'image' | 'file' | 'audio';
  name: string;
  size: number;
}> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/chat/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// ============================================================================
// Export default object for convenience
// ============================================================================

export default {
  // Contacts
  getContacts,
  initializeGroups,
  // Conversations
  getConversations,
  resetUnreadCount,
  muteConversation,
  deleteConversation,
  // Messages
  getMessages,
  getMessageContext,
  sendMessage,
  markMessageSeen,
  editMessage,
  deleteMessage,
  uploadAttachment,
};