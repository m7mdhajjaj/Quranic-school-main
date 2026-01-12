import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { router } from "expo-router";
import { MessageSquare, Search, X, Users } from "lucide-react-native";
import { useAuth } from "../../../Context/AuthContext";
import ConversationItem from "@/components/chat/ConversationItem";
import { useConversations } from "@/hooks/chat";
import type { Conversation } from "../../../types/chat";
import api from "../../../Api/api";

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: { url: string };
}

export default function ChatScreen() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [view, setView] = useState<"conversations" | "contacts">(
    "conversations"
  );
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  const { conversations, loading, resetUnreadCount, fetchConversations } =
    useConversations(searchTerm);

  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch contacts when switching to contacts view
  const fetchContacts = useCallback(async () => {
    if (contacts.length > 0) return; // Already loaded

    setContactsLoading(true);
    try {
      const res = await api.get("/chat/contacts");
      const allContacts: Contact[] = [];

      if (res.data.teachers) {
        res.data.teachers.forEach((t: any) => {
          allContacts.push({
            _id: t._id,
            firstName: t.firstName,
            lastName: t.lastName,
            role: "معلم",
            avatar: t.avatar,
          });
        });
      }

      if (res.data.students) {
        res.data.students.forEach((s: any) => {
          allContacts.push({
            _id: s._id,
            firstName: s.firstName,
            lastName: s.lastName,
            role: "طالب",
            avatar: s.avatar,
          });
        });
      }

      if (res.data.admins) {
        res.data.admins.forEach((a: any) => {
          allContacts.push({
            _id: a._id,
            firstName: a.firstName,
            lastName: a.lastName,
            role: "مدير",
            avatar: a.avatar,
          });
        });
      }

      setContacts(allContacts);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setContactsLoading(false);
    }
  }, [contacts.length]);

  useEffect(() => {
    if (view === "contacts") {
      fetchContacts();
    }
  }, [view, fetchContacts]);

  const handleSelectConversation = async (conv: Conversation) => {
    // Reset unread count
    if (conv.unreadCount > 0) {
      if (conv.type === "DM") {
        const otherParticipant = conv.participants.find(
          (p) => p.userId._id !== user?._id
        );
        if (otherParticipant) {
          await resetUnreadCount("DM", otherParticipant.userId._id);
        }
      } else if (conv.type === "GROUP" && conv.groupId) {
        await resetUnreadCount("GROUP", conv.groupId._id);
      }
    }

    // Navigate to chat window
    const targetInfo = getTargetInfo(conv);
    if (targetInfo) {
      const params = new URLSearchParams({
        chatType: targetInfo.chatType,
        targetId: targetInfo.targetId,
        targetName: targetInfo.targetName,
        targetAvatar: targetInfo.targetAvatar || "",
      });
      router.push(`/chat/${conv._id}?${params.toString()}`);
    }
  };

  const getTargetInfo = (conv: Conversation) => {
    if (conv.type === "GROUP" && conv.groupId) {
      return {
        chatType: "GROUP",
        targetId: conv.groupId._id,
        targetName: conv.groupId.name,
        targetAvatar: conv.groupId.image?.url,
      };
    } else {
      const otherParticipant = conv.participants.find(
        (p) => p.userId._id !== user?._id
      );

      if (otherParticipant) {
        return {
          chatType: "DM",
          targetId: otherParticipant.userId._id,
          targetName: `${otherParticipant.userId.firstName} ${otherParticipant.userId.lastName}`,
          targetAvatar: otherParticipant.userId.avatar?.url,
        };
      }
    }
    return null;
  };

  const handleSelectContact = (contact: any) => {
    const chatId = `new-${contact._id}`;
    const params = new URLSearchParams({
      chatType: "DM",
      targetId: contact._id,
      targetName: `${contact.firstName} ${contact.lastName}`,
      targetAvatar: contact.avatar?.url || "",
    });
    router.push(`/chat/${chatId}?${params.toString()}`);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-emerald-600 px-4 py-3 shadow-lg">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <MessageSquare size={24} color="white" />
            <Text className="text-xl font-bold text-white">المحادثات</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-emerald-700 rounded-lg">
            {showSearch ? (
              <X size={20} color="white" />
            ) : (
              <Search size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View className="mt-3">
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="ابحث عن محادثة..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              className="w-full px-4 py-2.5 rounded-xl bg-white/20 text-white border border-white/30"
              textAlign="right"
            />
          </View>
        )}
      </View>

      {/* Tabs */}
      <View className="bg-white border-b border-gray-200 p-4">
        <View className="flex-row p-1 bg-gray-100 rounded-xl">
          <TouchableOpacity
            onPress={() => setView("conversations")}
            className={`flex-1 py-2 px-3 rounded-lg items-center justify-center flex-row gap-2 ${
              view === "conversations" ? "bg-white shadow-sm" : ""
            }`}>
            <MessageSquare
              size={16}
              color={view === "conversations" ? "#10b981" : "#6b7280"}
            />
            <Text
              className={`text-sm font-bold ${
                view === "conversations" ? "text-emerald-600" : "text-gray-500"
              }`}>
              المحادثات
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setView("contacts")}
            className={`flex-1 py-2 px-3 rounded-lg items-center justify-center flex-row gap-2 ${
              view === "contacts" ? "bg-white shadow-sm" : ""
            }`}>
            <Users
              size={16}
              color={view === "contacts" ? "#10b981" : "#6b7280"}
            />
            <Text
              className={`text-sm font-bold ${
                view === "contacts" ? "text-emerald-600" : "text-gray-500"
              }`}>
              جهات الاتصال
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conversations List */}
      {view === "conversations" ? (
        conversations.length === 0 ? (
          <View className="flex-1 items-center justify-center p-4">
            <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
              <MessageSquare size={32} color="#9ca3af" />
            </View>
            <Text className="text-gray-900 font-medium mb-1">
              لا توجد محادثات
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              ابدأ محادثة جديدة من جهات الاتصال
            </Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ConversationItem
                conversation={item}
                currentUserId={user?._id || ""}
                onPress={() => handleSelectConversation(item)}
              />
            )}
            contentContainerStyle={{ padding: 8 }}
          />
        )
      ) : contactsLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : contacts.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
            <Users size={32} color="#9ca3af" />
          </View>
          <Text className="text-gray-900 font-medium mb-1">
            لا توجد جهات اتصال
          </Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelectContact(item)}
              className="flex-row items-center p-3 mx-1 my-0.5 rounded-xl bg-white active:bg-emerald-50">
              <View className="ml-3">
                {item.avatar?.url ? (
                  <Image
                    source={{ uri: item.avatar.url }}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-full bg-emerald-500 items-center justify-center">
                    <Text className="text-white font-bold text-lg">
                      {item.firstName.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-800">
                  {item.firstName} {item.lastName}
                </Text>
                <Text className="text-sm text-gray-500">{item.role}</Text>
              </View>
              <View className="p-2">
                <MessageSquare size={20} color="#10b981" />
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: 8 }}
        />
      )}

      {/* Floating Action Button */}
      {view === "conversations" && (
        <TouchableOpacity
          onPress={() => setView("contacts")}
          className="absolute bottom-6 right-6 w-14 h-14 bg-emerald-600 rounded-full shadow-2xl items-center justify-center active:scale-95">
          <Users size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}
