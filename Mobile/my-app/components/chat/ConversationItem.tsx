import React, { memo } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Trash2 } from "lucide-react-native";
import { useConversationItem } from "../../hooks/chat";
import type { Conversation } from "../../types/chat";

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  onPress: () => void;
  onDelete?: (id: string) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = memo(
  ({ conversation, currentUserId, onPress, onDelete }) => {
    const {
      displayInfo,
      formattedTime,
      lastMessageText,
      showUnreadBadge,
      unreadCountText,
    } = useConversationItem({ conversation, currentUserId });

    const handleDelete = (e: any) => {
      e.stopPropagation();
      onDelete?.(conversation._id);
    };

    return (
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center p-3 mx-1 my-0.5 rounded-xl bg-white active:bg-emerald-50">
        {/* Avatar */}
        <View className="ml-3 relative">
          {displayInfo.avatar ? (
            <Image
              source={{ uri: displayInfo.avatar }}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-emerald-500 items-center justify-center">
              <Text className="text-white font-bold text-lg">
                {displayInfo.name.charAt(0)}
              </Text>
            </View>
          )}
          {conversation.type === "DM" && (
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
          )}
        </View>

        {/* Content */}
        <View className="flex-1 min-w-0">
          <View className="flex-row justify-between items-start mb-0.5">
            <Text
              className="text-base font-bold text-gray-800 flex-1"
              numberOfLines={1}>
              {displayInfo.name}
            </Text>
            {formattedTime && (
              <Text className="text-xs text-gray-400 ml-2">
                {formattedTime}
              </Text>
            )}
          </View>

          <View className="flex-row justify-between items-center">
            <Text
              className={`text-sm flex-1 ${
                showUnreadBadge
                  ? "text-gray-800 font-semibold"
                  : "text-gray-500"
              }`}
              numberOfLines={1}>
              {lastMessageText}
            </Text>

            {showUnreadBadge && (
              <View className="min-w-[18px] h-[18px] items-center justify-center bg-emerald-500 rounded-full ml-2">
                <Text className="text-white text-xs font-bold">
                  {unreadCountText}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Delete Button */}
        {onDelete && (
          <TouchableOpacity onPress={handleDelete} className="p-2 ml-2">
            <Trash2 size={16} color="#ef4444" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }
);

ConversationItem.displayName = "ConversationItem";

export default ConversationItem;
