// ============================================================================
// Hooks Index - Export all chat hooks
// ============================================================================

export { useChat } from './useChat';
export { useChatContacts, type Contact, type Group } from './useChatContacts';
export { useChatMessages } from './useChatMessages';
export { useChatSocket } from './useChatSocket';
export { useConversations } from './useConversations';
export { useConversationItem } from './useConversationItem';
export { useGroupConversations } from './useGroupConversations';
export { useChatLayout } from './useChatLayout';
export { useMessageOperations } from './useMessageOperations';
export { useMessageInput } from './useMessageInput';
export { useChatSidebar } from './useChatSidebar';
export { useMentionDropdown, type MentionUser, type DisplayItem, type AllOption } from './useMentionDropdown';
export { useMentions } from './useMentions';
export { useMessageItem } from './useMessageItem';
export { useChatWindow } from './useChatWindow';
export { useOnlineStatus } from './useOnlineStatus';
export { useChatHeader } from './useChatHeader';
export { useDateDividers } from './useDateDividers';
export { useConversationsTyping } from './useConversationsTyping';

// Re-export types from types/index.ts for convenience
export type {
  ChatType,
  UserModel,
  User,
  Participant,
  GroupInfo,
  Message,
  Conversation,
  Contact,
  MentionItem,
  Attachment,
  SeenByItem,
  DeliveredToItem,
  AttachmentType,
} from '../types';

// Re-export role helpers
export { ROLE_NAMES, ROLE_COLORS } from '../types';
