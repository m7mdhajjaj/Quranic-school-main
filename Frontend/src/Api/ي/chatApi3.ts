// import api from './api';

// // ============================================================================
// // Chat API
// // ============================================================================

// export interface Message {
//   _id?: string;
//   sender: string;
//   receiver?: string;
//   group?: string;
//   content: string;
//   timestamp: Date | string;
//   isRead?: boolean;
// }

// export interface Conversation {
//   _id: string;
//   participants: string[];
//   lastMessage?: Message;
//   unreadCount?: number;
// }

// // Get conversations
// export const getConversations = async (): Promise<Conversation[]> => {
//   const response = await api.get('/chat/conversations');
//   return response.data;
// };

// // Get messages
// export const getMessages = async (params: {
//   conversationId?: string;
//   userId?: string;
//   groupId?: string;
// }): Promise<Message[]> => {
//   const response = await api.get('/chat/messages', { params });
//   return response.data;
// };

// // Send message
// export const sendMessage = async (data: {
//   receiver?: string;
//   group?: string;
//   content: string;
// }): Promise<Message> => {
//   const response = await api.post('/chat/messages', data);
//   return response.data;
// };

// // Mark messages as read
// export const markMessagesAsRead = async (messageIds: string[]): Promise<void> => {
//   await api.put('/chat/messages/read', { messageIds });
// };

// // Get unread count
// export const getUnreadCount = async (): Promise<{ count: number }> => {
//   const response = await api.get('/chat/unread-count');
//   return response.data;
// };
