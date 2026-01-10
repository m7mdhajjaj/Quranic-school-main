import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Check, CheckCheck } from "lucide-react-native";
import type { Message } from "../../types/chat";

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  onReply?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = React.memo(
  ({ message, isOwn, onReply, onDelete }) => {
    if (message.deletedForAll) {
      return (
        <View className={`mb-3 ${isOwn ? "items-end" : "items-start"}`}>
          <View className="max-w-[80%] px-4 py-2 rounded-2xl bg-gray-200">
            <Text className="text-gray-500 italic text-sm">
              🚫 تم حذف الرسالة
            </Text>
          </View>
        </View>
      );
    }

    const getStatusIcon = () => {
      if (!isOwn || message._optimistic) return null;

      if (message.chatType === "DM") {
        if (message.readAt) {
          return <CheckCheck size={14} color="#3b82f6" />;
        }
        if (message.deliveredAt) {
          return <CheckCheck size={14} color="#d1d5db" />;
        }
      } else if (message.chatType === "GROUP") {
        const seenCount = message.seenBy?.length || 0;
        if (seenCount > 0) {
          return <CheckCheck size={14} color="#3b82f6" />;
        }
        const deliveredCount = message.deliveredTo?.length || 0;
        if (deliveredCount > 0) {
          return <CheckCheck size={14} color="#d1d5db" />;
        }
      }

      return <Check size={14} color="#d1d5db" />;
    };

    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <View className={`mb-3 ${isOwn ? "items-end" : "items-start"}`}>
        {/* Reply Preview */}
        {message.replyTo && (
          <View className="max-w-[80%] mb-1 px-3 py-1.5 rounded-lg bg-gray-100 border-r-2 border-emerald-500">
            <Text
              className="text-xs text-emerald-700 font-semibold"
              numberOfLines={1}>
              رد على {message.replyTo.sender.firstName}
            </Text>
            <Text className="text-xs text-gray-600" numberOfLines={2}>
              {message.replyTo.text}
            </Text>
          </View>
        )}

        {/* Message Bubble */}
        <TouchableOpacity
          onLongPress={() => onDelete?.(message._id)}
          activeOpacity={0.7}
          className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
            isOwn
              ? "bg-emerald-500 rounded-br-none"
              : "bg-white rounded-bl-none shadow-sm"
          }`}>
          {/* Sender Name for Group Chats */}
          {!isOwn && message.chatType === "GROUP" && (
            <Text className="text-xs font-bold text-emerald-700 mb-1">
              {message.sender.firstName}
            </Text>
          )}

          {/* Message Text */}
          <Text
            className={`text-sm leading-relaxed ${
              isOwn ? "text-white" : "text-gray-800"
            }`}
            style={{ textAlign: "right" }}>
            {message.text}
          </Text>

          {/* Edited Badge */}
          {message.edited && (
            <Text
              className={`text-xs mt-1 ${isOwn ? "text-emerald-100" : "text-gray-400"}`}>
              معدلة
            </Text>
          )}

          {/* Time & Status */}
          <View className="flex-row items-center justify-end gap-1 mt-1">
            <Text
              className={`text-xs ${isOwn ? "text-emerald-100" : "text-gray-400"}`}>
              {formatTime(message.createdAt)}
            </Text>
            {getStatusIcon()}
          </View>
        </TouchableOpacity>

        {/* Optimistic Indicator */}
        {message._optimistic && (
          <View className="mt-1 flex-row items-center gap-1">
            <View className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" />
            <Text className="text-xs text-gray-400">جاري الإرسال...</Text>
          </View>
        )}
      </View>
    );
  }
);

MessageItem.displayName = "MessageItem";

export default MessageItem;
