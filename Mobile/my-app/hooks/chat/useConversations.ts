import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../Api/api";
import type { Conversation } from "../../types/chat";

export type { Conversation };

export const useConversations = (search?: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const conversationsRef = useRef(conversations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/chat/conversations", {
        params: { search },
      });

      setConversations(res.data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    const previousConversations = conversationsRef.current;
    setConversations((prev) => prev.filter((c) => c._id !== conversationId));

    try {
      await api.delete(`/chat/conversations/${conversationId}`);
    } catch (err: any) {
      console.error("Failed to delete conversation:", err);
      setConversations(previousConversations);
      throw err;
    }
  }, []);

  const resetUnreadCount = useCallback(
    async (chatType: "DM" | "GROUP", targetId: string) => {
      try {
        await api.post("/chat/conversations/reset-unread", {
          chatType,
          targetId,
        });
        setConversations((prev) =>
          prev.map((conv) => {
            if (chatType === "DM") {
              const isMatch = conv.participants.some(
                (p) => p.userId._id === targetId
              );
              return isMatch ? { ...conv, unreadCount: 0 } : conv;
            } else {
              return conv.groupId?._id === targetId
                ? { ...conv, unreadCount: 0 }
                : conv;
            }
          })
        );
      } catch (err) {
        console.error("Failed to reset unread count:", err);
      }
    },
    []
  );

  const updateConversationOnNewMessage = useCallback(
    (message: any, currentUserId?: string) => {
      setConversations((prev) => {
        const updated = [...prev];

        const index = updated.findIndex((conv) => {
          if (message.chatType === "DM") {
            return conv.participants.some(
              (p) =>
                p.userId._id === message.sender?._id ||
                p.userId._id === message.recipient
            );
          } else {
            return conv.groupId?._id === message.groupId;
          }
        });

        if (index !== -1) {
          const isFromCurrentUser = message.sender?._id === currentUserId;

          const updatedConv = {
            ...updated[index],
            lastMessage: message,
            updatedAt: message.createdAt,
            unreadCount: isFromCurrentUser
              ? updated[index].unreadCount
              : (updated[index].unreadCount || 0) + 1,
          };

          updated.splice(index, 1);
          updated.unshift(updatedConv);
        } else {
          fetchConversations();
        }

        return updated;
      });
    },
    [fetchConversations]
  );

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    resetUnreadCount,
    updateConversationOnNewMessage,
    deleteConversation,
  };
};
