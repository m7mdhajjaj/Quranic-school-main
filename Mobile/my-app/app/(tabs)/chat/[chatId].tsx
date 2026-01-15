import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Keyboard,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Send, ArrowRight, Loader2 } from "lucide-react-native";
import { useAuth } from "../../../Context/AuthContext";
import MessageItem from "@/components/chat/MessageItem";
import api from "../../../Api/api";
import type { Message } from "../../../types/chat";

export default function ChatWindow() {
  const params = useLocalSearchParams<{
    chatId: string;
    chatType: "DM" | "GROUP";
    targetId: string;
    targetName: string;
    targetAvatar?: string;
  }>();

  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const { chatType, targetId, targetName, targetAvatar } = params;

  // Handle keyboard on Android
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await api.get("/chat/messages", {
          params: {
            chatType,
            targetId,
            limit: 50,
          },
        });

        // The API returns messages directly as an array
        const fetchedMessages = Array.isArray(res.data)
          ? res.data
          : res.data.messages || [];
        setMessages(fetchedMessages);
        console.log("Fetched messages:", fetchedMessages.length);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };

    if (chatType && targetId) {
      fetchMessages();
    }
  }, [chatType, targetId]);

  // Send message
  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const payload =
        chatType === "DM"
          ? { chatType: "DM", recipientId: targetId, text: messageText }
          : { chatType: "GROUP", groupId: targetId, text: messageText };

      const res = await api.post("/chat/messages", payload);

      if (res.data) {
        setMessages((prev) => [...prev, res.data]);
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setInputText(messageText); // Restore text on error
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-100"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      style={{ flex: 1 }}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 active:bg-gray-100 rounded-lg">
            <ArrowRight size={20} color="#374151" />
          </TouchableOpacity>

          {/* Avatar */}
          {targetAvatar ? (
            <Image
              source={{ uri: targetAvatar }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-emerald-500 items-center justify-center">
              <Text className="text-white font-bold">
                {targetName?.charAt(0) || "؟"}
              </Text>
            </View>
          )}

          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
              {targetName}
            </Text>
            <Text className="text-xs text-gray-500">
              {chatType === "GROUP" ? "مجموعة" : "محادثة"}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) =>
          item._id || item.clientTempId || String(Math.random())
        }
        renderItem={({ item }) => (
          <MessageItem message={item} isOwn={item.sender?._id === user?._id} />
        )}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">لا توجد رسائل</Text>
            <Text className="text-gray-400 text-sm mt-1">ابدأ المحادثة</Text>
          </View>
        }
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }}
        keyboardShouldPersistTaps="handled"
      />

      {/* Input */}
      <View
        className="p-4 bg-white border-t border-gray-200"
        style={{
          paddingBottom:
            Platform.OS === "android" && keyboardHeight > 0 ? 16 : 16,
          marginBottom:
            Platform.OS === "android" && keyboardHeight > 0
              ? keyboardHeight
              : 0,
        }}>
        <View className="flex-row items-end gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="اكتب رسالة..."
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={1000}
            className="flex-1 px-3 py-2 text-gray-900 max-h-24 text-right"
            textAlign="right"
            editable={!sending}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
            className={`p-3 rounded-full items-center justify-center ${
              inputText.trim() && !sending ? "bg-emerald-500" : "bg-gray-300"
            }`}>
            {sending ? (
              <Loader2 size={20} color="white" />
            ) : (
              <Send size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
