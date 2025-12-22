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

export type Message = {
  _id: string;
  chatType: 'DM' | 'GROUP';
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  text: string;
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
  replyTo?: {
    _id: string;
    text: string;
    sender: {
      name: string;
    };
  };
  deliveredAt?: string;
  readAt?: string;
  deliveredTo?: string[];
  seenBy?: Array<{
    userId: string;
    readAt: string;
  }>;
  edited?: boolean;
  editedAt?: string;
  deletedFor?: string[];
  deletedForAll?: boolean;
  createdAt: string;
  clientTempId?: string;
}
