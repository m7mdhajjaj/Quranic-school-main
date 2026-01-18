import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import {
  MessageSquare,
  Search,
  X,
  Users,
  UsersRound,
} from "lucide-react-native";
import { useAuth } from "@/Context/AuthContext";
import ConversationItem from "@/components/chat/ConversationItem";
import { useConversations } from "@/hooks/chat";
import type { Conversation } from "@/types/chat";
import api from "@/Api/api";

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: { url: string };
  studentId?: number;
  teacherId?: number;
  adminId?: number;
}

interface Group {
  _id: string;
  name: string;
  description?: string;
  image?: { url: string };
  teacher?: string;
}

export default function ChatScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [view, setView] = useState<"conversations" | "contacts">(
    "conversations"
  );
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  const { conversations, loading, resetUnreadCount, fetchConversations } =
    useConversations(searchTerm);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Fetch contacts when switching to contacts view
  const fetchContacts = useCallback(async () => {
    if (!user) return;
    if (contacts.length > 0 || groups.length > 0) return; // Already loaded

    setContactsLoading(true);
    try {
      const res = await api.get("/chat/contacts");
      // Response returns { contacts: [], groups: [] }
      setContacts(res.data.contacts || []);
      setGroups(res.data.groups || []);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setContactsLoading(false);
    }
  }, [user, contacts.length, groups.length]);

  useEffect(() => {
    if (view === "contacts" && user) {
      fetchContacts();
    }
  }, [view, fetchContacts, user]);

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  // Show loading if no user (will redirect)
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

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

  const handleSelectContact = (contact: Contact) => {
    const chatId = `new-${contact._id}`;
    const params = new URLSearchParams({
      chatType: "DM",
      targetId: contact._id,
      targetName: `${contact.firstName} ${contact.lastName}`,
      targetAvatar: contact.avatar?.url || "",
    });
    router.push(`/chat/${chatId}?${params.toString()}`);
  };

  const handleSelectGroup = (group: Group) => {
    const chatId = `group-${group._id}`;
    const params = new URLSearchParams({
      chatType: "GROUP",
      targetId: group._id,
      targetName: group.name,
      targetAvatar: group.image?.url || "",
    });
    router.push(`/chat/${chatId}?${params.toString()}`);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "student":
        return "طالب";
      case "teacher":
        return "معلم";
      case "admin":
        return "مدير";
      case "secretary":
        return "سكرتير";
      case "teacherAssistant":
        return "مساعد معلم";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitle}>
            <MessageSquare size={24} color="white" />
            <Text style={styles.headerText}>المحادثات</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowSearch(!showSearch)}
            style={styles.searchButton}>
            {showSearch ? (
              <X size={20} color="white" />
            ) : (
              <Search size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="ابحث عن محادثة..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              style={styles.searchInput}
              textAlign="right"
            />
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsWrapper}>
          <TouchableOpacity
            onPress={() => setView("conversations")}
            style={[styles.tab, view === "conversations" && styles.activeTab]}>
            <MessageSquare
              size={16}
              color={view === "conversations" ? "#10b981" : "#6b7280"}
            />
            <Text
              style={[
                styles.tabText,
                view === "conversations" && styles.activeTabText,
              ]}>
              المحادثات
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setView("contacts")}
            style={[styles.tab, view === "contacts" && styles.activeTab]}>
            <Users
              size={16}
              color={view === "contacts" ? "#10b981" : "#6b7280"}
            />
            <Text
              style={[
                styles.tabText,
                view === "contacts" && styles.activeTabText,
              ]}>
              جهات الاتصال
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conversations List */}
      {view === "conversations" ? (
        conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <MessageSquare size={32} color="#9ca3af" />
            </View>
            <Text style={styles.emptyTitle}>لا توجد محادثات</Text>
            <Text style={styles.emptySubtitle}>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : contacts.length === 0 && groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Users size={32} color="#9ca3af" />
          </View>
          <Text style={styles.emptyTitle}>لا توجد جهات اتصال</Text>
        </View>
      ) : (
        <FlatList
          data={[
            ...groups.map((g) => ({ ...g, type: "group" as const })),
            ...contacts.map((c) => ({ ...c, type: "contact" as const })),
          ]}
          keyExtractor={(item) => `${item.type}-${item._id}`}
          ListHeaderComponent={
            groups.length > 0 ? (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  المجموعات ({groups.length})
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item, index }) => {
            const isFirstContact =
              item.type === "contact" && index === groups.length;

            if (item.type === "group") {
              return (
                <TouchableOpacity
                  onPress={() => handleSelectGroup(item as Group)}
                  style={styles.contactItem}>
                  <View style={styles.avatarContainer}>
                    {(item as Group).image?.url ? (
                      <Image
                        source={{ uri: (item as Group).image!.url }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View
                        style={[styles.avatarPlaceholder, styles.groupAvatar]}>
                        <UsersRound size={24} color="white" />
                      </View>
                    )}
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>
                      {(item as Group).name}
                    </Text>
                    <Text style={styles.contactRole}>مجموعة</Text>
                  </View>
                  <View style={styles.messageIcon}>
                    <MessageSquare size={20} color="#3b82f6" />
                  </View>
                </TouchableOpacity>
              );
            }

            return (
              <View>
                {isFirstContact && contacts.length > 0 && (
                  <View style={[styles.sectionHeader, { marginTop: 8 }]}>
                    <Text style={styles.sectionTitle}>
                      جهات الاتصال ({contacts.length})
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => handleSelectContact(item as Contact)}
                  style={styles.contactItem}>
                  <View style={styles.avatarContainer}>
                    {(item as Contact).avatar?.url ? (
                      <Image
                        source={{ uri: (item as Contact).avatar!.url }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                          {(item as Contact).firstName.charAt(0)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>
                      {(item as Contact).firstName} {(item as Contact).lastName}
                    </Text>
                    <Text style={styles.contactRole}>
                      {getRoleLabel((item as Contact).role)}
                    </Text>
                  </View>
                  <View style={styles.messageIcon}>
                    <MessageSquare size={20} color="#10b981" />
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
          contentContainerStyle={{ padding: 8 }}
        />
      )}

      {/* Floating Action Button */}
      {view === "conversations" && (
        <TouchableOpacity
          onPress={() => setView("contacts")}
          style={styles.fab}>
          <Users size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    backgroundColor: "#059669",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  searchButton: {
    padding: 8,
    borderRadius: 8,
  },
  searchContainer: {
    marginTop: 12,
  },
  searchInput: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  tabsContainer: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 16,
  },
  tabsWrapper: {
    flexDirection: "row",
    padding: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  activeTab: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#059669",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#f3f4f6",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    color: "#111827",
    fontWeight: "500",
    marginBottom: 4,
  },
  emptySubtitle: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
  },
  sectionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4b5563",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 4,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: "white",
  },
  avatarContainer: {
    marginLeft: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  groupAvatar: {
    backgroundColor: "#3b82f6",
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  contactRole: {
    fontSize: 14,
    color: "#6b7280",
  },
  messageIcon: {
    padding: 8,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: "#059669",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
