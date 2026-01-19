// ============================================================================
// Chat Types - Synced with Backend and API
// ============================================================================

// Enums matching Backend
export type ChatType = 'DM' | 'GROUP';
export type UserModel = 'Student' | 'Teacher' | 'Admin' | 'Secretary' | 'TeacherAssistant';
export type AttachmentType = 'image' | 'file' | 'audio';

// User/Participant Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  name?: string;
  avatar?: { url: string };
}

export interface Participant {
  userId: User;
  userModel: UserModel;
  mutedUntil?: string;
}

// Group Type
export interface GroupInfo {
  _id: string;
  name: string;
  description?: string;
  image?: { url: string };
  teacher?: string;
}

// Conversation Type
export type Conversation = {
  _id: string;
  type: ChatType;
  participants: Participant[];
  groupId?: GroupInfo;
  lastMessage?: {
    _id: string;
    text: string;
    createdAt: string;
    sender: string;
    deletedForAll?: boolean;
  };
  unreadCount: number;
  updatedAt: string;
}

// Message Types
export interface Attachment {
  url: string;
  type: AttachmentType;
  name?: string;
  size?: number;
}

export interface SeenByItem {
  userId: string;
  seenAt: string;
  user?: User;
}

export interface DeliveredToItem {
  userId: string;
  deliveredAt: string;
}

export interface MentionItem {
  type: 'user' | 'all';
  user?: User;
}

export type Message = {
  _id: string;
  chatType: ChatType;
  sender: User;
  senderModel?: UserModel;
  recipient?: string;
  recipientModel?: UserModel;
  groupId?: string;
  text: string;
  attachments?: Attachment[];
  replyTo?: {
    _id: string;
    text: string;
    sender: User;
  };
  mentions?: MentionItem[];
  deliveredAt?: string;
  readAt?: string;
  deliveredTo?: DeliveredToItem[];
  seenBy?: SeenByItem[];
  edited?: boolean;
  editedAt?: string;
  deletedFor?: string[];
  deletedForAll?: boolean;
  createdAt: string;
  clientTempId?: string;
  _optimistic?: boolean;
}

// Contact Types
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

// Role display names (Arabic)
export const ROLE_NAMES: Record<UserModel, string> = {
  'Student': 'طالب',
  'Teacher': 'معلم',
  'Admin': 'مدير',
  'Secretary': 'سكرتير',
  'TeacherAssistant': 'مساعد معلم'
};

// Role colors for UI
export const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  'student': { bg: 'bg-blue-50', text: 'text-blue-600' },
  'teacher': { bg: 'bg-purple-50', text: 'text-purple-600' },
  'admin': { bg: 'bg-orange-50', text: 'text-orange-600' },
  'secretary': { bg: 'bg-teal-50', text: 'text-teal-600' },
  'teacherAssistant': { bg: 'bg-indigo-50', text: 'text-indigo-600' }
};
