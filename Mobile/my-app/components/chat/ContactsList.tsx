import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { Users, MessageSquare } from "lucide-react-native";
import api from "../../Api/api";

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: { url: string };
}

interface ContactsListProps {
  onSelectContact: (contact: Contact) => void;
}

export default function ContactsList({ onSelectContact }: ContactsListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (contacts.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
          <Users size={32} color="#9ca3af" />
        </View>
        <Text className="text-gray-900 font-medium mb-1">
          لا توجد جهات اتصال
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={contacts}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => onSelectContact(item)}
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
  );
}
