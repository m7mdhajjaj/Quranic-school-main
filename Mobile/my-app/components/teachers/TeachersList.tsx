// ============================================================================
// TeachersList - عرض قائمة المعلمين
// ============================================================================

import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import type { Teacher } from "@/types/teacher.types";

interface TeachersListProps {
  teachers: Teacher[];
  selectedTeachers: Set<string>;
  onToggleSelection: (teacherId: string) => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacherId: string) => void;
  ListHeaderComponent?: React.ReactElement;
  loading?: boolean;
}

export const TeachersList: React.FC<TeachersListProps> = ({
  teachers,
  selectedTeachers,
  onToggleSelection,
  onEdit,
  onDelete,
  ListHeaderComponent,
  loading = false,
}) => {
  const renderTeacher = ({ item }: { item: Teacher }) => {
    const isSelected = selectedTeachers.has(item._id || "");
    const fullName = `${item.firstName} ${item.lastName}`;
    const groupsCount = item.groups?.length || 0;

    return (
      <TouchableOpacity
        onPress={() => onEdit(item)}
        onLongPress={() => onToggleSelection(item._id || "")}
        activeOpacity={0.7}
        className={`bg-white rounded-2xl p-5 mb-4 shadow-lg border-2 ${
          isSelected ? "border-emerald-500" : "border-gray-200"
        }`}>
        {/* Header - Name and Status */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 mb-1">
              {fullName}
            </Text>
            <View className="flex-row items-center gap-2 flex-wrap">
              <View
                className={`px-3 py-1 rounded-full ${
                  item.isActive
                    ? "bg-emerald-100 border border-emerald-300"
                    : "bg-gray-100 border border-gray-300"
                }`}>
                <Text
                  className={`text-xs font-bold ${
                    item.isActive ? "text-emerald-700" : "text-gray-600"
                  }`}>
                  {item.isActive ? "نشط" : "غير نشط"}
                </Text>
              </View>

              {item.gender && (
                <View className="px-3 py-1 rounded-full bg-blue-100 border border-blue-300">
                  <Text className="text-xs font-bold text-blue-700">
                    {item.gender === "ذكر" || item.gender === "male"
                      ? "👨"
                      : "👩"}{" "}
                    {item.gender}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => onEdit(item)}
              className="bg-blue-500 rounded-full p-3"
              style={{ elevation: 2 }}>
              <Text className="text-white text-base">✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete(item._id || "")}
              className="bg-red-500 rounded-full p-3"
              style={{ elevation: 2 }}>
              <Text className="text-white text-base">🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Info */}
        <View className="bg-gray-50 rounded-xl p-3 mb-3">
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-lg">📧</Text>
            <Text className="text-gray-700 flex-1" numberOfLines={1}>
              {item.email}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-lg">📱</Text>
            <Text className="text-gray-700">{item.phoneNumber}</Text>
          </View>
        </View>

        {/* Groups Info */}
        <View className="bg-emerald-50 rounded-lg p-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl">📚</Text>
              <Text className="text-emerald-800 font-semibold">
                عدد الحلقات
              </Text>
            </View>
            <View
              className={`px-4 py-2 rounded-full ${
                groupsCount > 0 ? "bg-emerald-500" : "bg-gray-400"
              }`}>
              <Text className="text-white font-bold text-lg">
                {groupsCount}
              </Text>
            </View>
          </View>

          {groupsCount > 0 && item.groups && (
            <View className="mt-2 pt-2 border-t border-emerald-200">
              {item.groups.slice(0, 3).map((group, index) => (
                <Text
                  key={index}
                  className="text-sm text-emerald-700 mb-1"
                  numberOfLines={1}>
                  • {group.name}
                </Text>
              ))}
              {groupsCount > 3 && (
                <Text className="text-xs text-emerald-600 mt-1">
                  +{groupsCount - 3} حلقة أخرى
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Additional Info */}
        {(item.age || item.residence) && (
          <View className="flex-row gap-2 mt-3 flex-wrap">
            {item.age && (
              <View className="bg-purple-100 px-3 py-1 rounded-full">
                <Text className="text-purple-700 text-sm">
                  🎂 {item.age} سنة
                </Text>
              </View>
            )}
            {item.residence && (
              <View className="bg-cyan-100 px-3 py-1 rounded-full">
                <Text className="text-cyan-700 text-sm" numberOfLines={1}>
                  📍 {item.residence}
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (teachers.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-6xl mb-4">👨‍🏫</Text>
        <Text className="text-gray-500 text-lg">لا يوجد معلمين</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={teachers}
      renderItem={renderTeacher}
      keyExtractor={(item) => item._id || ""}
      contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
};
