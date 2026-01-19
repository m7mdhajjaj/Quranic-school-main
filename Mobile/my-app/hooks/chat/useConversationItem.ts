import { useMemo } from "react";
import type { Conversation } from "../../types/chat";

interface DisplayInfo {
  name: string;
  avatar?: string;
}

interface UseConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
}

interface UseConversationItemReturn {
  displayInfo: DisplayInfo;
  formattedTime: string;
  lastMessageText: string;
  showUnreadBadge: boolean;
  unreadCountText: string;
}

export const useConversationItem = ({
  conversation,
  currentUserId,
}: UseConversationItemProps): UseConversationItemReturn => {
  const displayInfo = useMemo((): DisplayInfo => {
    if (conversation.type === "GROUP" && conversation.groupId) {
      return {
        name: conversation.groupId.name,
        avatar: conversation.groupId.image?.url,
      };
    }

    const otherParticipant = conversation.participants.find(
      (p) => p?.userId?._id && p.userId._id !== currentUserId
    );

    if (otherParticipant?.userId) {
      return {
        name: `${otherParticipant.userId.firstName} ${otherParticipant.userId.lastName}`,
        avatar: otherParticipant.userId.avatar?.url,
      };
    }

    return { name: "محادثة", avatar: undefined };
  }, [conversation, currentUserId]);

  const formattedTime = useMemo(() => {
    if (!conversation.lastMessage?.createdAt) return "";

    const messageDate = new Date(conversation.lastMessage.createdAt);
    const now = new Date();
    const diffInMs = now.getTime() - messageDate.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInHours < 168) {
      return messageDate.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  }, [conversation.lastMessage?.createdAt]);

  const lastMessageText = useMemo(() => {
    if (!conversation.lastMessage) return "No messages yet";
    return conversation.lastMessage.text || "";
  }, [conversation.lastMessage]);

  const showUnreadBadge = conversation.unreadCount > 0;

  const unreadCountText = useMemo(() => {
    if (conversation.unreadCount > 99) return "99+";
    return String(conversation.unreadCount);
  }, [conversation.unreadCount]);

  return {
    displayInfo,
    formattedTime,
    lastMessageText,
    showUnreadBadge,
    unreadCountText,
  };
};
