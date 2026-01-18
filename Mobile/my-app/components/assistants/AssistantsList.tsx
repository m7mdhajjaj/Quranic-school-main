// ============================================================================
// AssistantsList - قائمة مساعدي المدرسين
// ============================================================================

import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import type { TeacherAssistant } from "@/Api/teacherAssistantApi";

interface AssistantsListProps {
  assistants: TeacherAssistant[];
  loading: boolean;
  onEdit?: (assistant: TeacherAssistant) => void;
  onDelete?: (assistant: TeacherAssistant) => void;
  readOnly?: boolean;
}

export const AssistantsList: React.FC<AssistantsListProps> = ({
  assistants,
  loading,
  onEdit,
  onDelete,
  readOnly = false,
}) => {
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center py-20">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">جاري تحميل المساعدين...</Text>
      </View>
    );
  }

  if (assistants.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-20">
        <Text className="text-6xl mb-4">👨‍🏫</Text>
        <Text className="text-gray-600 text-lg font-semibold">
          لا يوجد مساعدين
        </Text>
        <Text className="text-gray-400 text-sm mt-2">
          قم بإضافة مساعد جديد للبدء
        </Text>
      </View>
    );
  }

  const renderAssistant = ({ item }: { item: TeacherAssistant }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-lg font-bold text-gray-900">
              {item.firstName} {item.lastName}
            </Text>
          </View>
          <Text className="text-gray-500 text-xs">#{item.assistantId}</Text>
        </View>
      </View>

      {/* Info Grid */}
      <View className="space-y-2">
        {/* Gender & Age */}
        <View className="flex-row gap-2">
          <View className="flex-1 bg-gray-50 rounded-lg p-2">
            <Text className="text-gray-500 text-xs mb-1">الجنس</Text>
            <Text className="text-gray-800 font-semibold">
              {item.gender || "-"}
            </Text>
          </View>
          <View className="flex-1 bg-gray-50 rounded-lg p-2">
            <Text className="text-gray-500 text-xs mb-1">الحلقات</Text>
            <Text className="text-gray-800 font-semibold">
              {item.allowedGroups?.length || 0} حلقة
            </Text>
          </View>
        </View>

        {/* Email */}
        {item.email && (
          <View className="bg-gray-50 rounded-lg p-2">
            <Text className="text-gray-500 text-xs mb-1">البريد</Text>
            <Text className="text-gray-800 font-semibold" numberOfLines={1}>
              {item.email}
            </Text>
          </View>
        )}

        {/* Phone */}
        <View className="bg-gray-50 rounded-lg p-2">
          <Text className="text-gray-500 text-xs mb-1">الهاتف</Text>
          <Text className="text-gray-800 font-semibold">
            {item.phoneNumber || "-"}
          </Text>
        </View>
      </View>

      {/* Actions - Only show if not readOnly */}
      {!readOnly && onEdit && onDelete && (
        <View className="flex-row gap-2 mt-4">
          <TouchableOpacity
            onPress={() => onEdit(item)}
            className="flex-1 bg-blue-500 rounded-xl py-3">
            <Text className="text-white font-bold text-center">تعديل</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(item)}
            className="flex-1 bg-red-500 rounded-xl py-3">
            <Text className="text-white font-bold text-center">حذف</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      data={assistants}
      renderItem={renderAssistant}
      keyExtractor={(item) => item._id}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-4"
    />
  );
};
