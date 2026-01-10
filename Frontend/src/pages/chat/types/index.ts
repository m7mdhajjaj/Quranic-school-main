export type Conversation = {
  _id: string;
  type: 'DM' | 'GROUP';
  participants: Array<{
    userId: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: { url: string };
    };
    userModel: string;
  }>;
  groupId?: {
    _id: string;
    name: string;
    description?: string;
    image?: { url: string };
  };
  lastMessage?: {
    _id: string;
    text: string;
    createdAt: string;
    sender: string;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  name?: string;
  avatar?: { url: string };
}

export interface SeenByItem {
  userId: string;
  seenAt: string;
  user?: User;
}

export interface MentionItem {
  type: 'user' | 'all';
  user?: User;
}

export type Message = {
  _id: string;
  chatType: 'DM' | 'GROUP';
  sender: User;
  text: string;
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
  replyTo?: {
    _id: string;
    text: string;
    sender: User;
  };
  mentions?: MentionItem[];
  deliveredAt?: string;
  readAt?: string;
  deliveredTo?: string[];
  seenBy?: SeenByItem[];
  edited?: boolean;
  editedAt?: string;
  deletedFor?: string[];
  deletedForAll?: boolean;
  createdAt: string;
  clientTempId?: string;
  _optimistic?: boolean;
}
