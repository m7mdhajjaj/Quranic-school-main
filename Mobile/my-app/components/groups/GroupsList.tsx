// ============================================================================
// GroupsList - عرض قائمة الحلقات
// ============================================================================

import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import type { Group } from "@/types/group.types";
import type { Teacher } from "@/Api/teacherApi";

interface GroupsListProps {
  groups: Group[];
  selectedGroups: Set<string>;
  onToggleSelection: (groupId: string) => void;
  onEdit: (group: Group) => void;
  onDelete: (groupId: string) => void;
  teachers?: Teacher[];
  ListHeaderComponent?: React.ReactElement;
}

export const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  selectedGroups,
  onToggleSelection,
  onEdit,
  onDelete,
  teachers = [],
  ListHeaderComponent,
}) => {
  const getTeacherName = (teacherValue: string): string => {
    // إذا كانت القيمة "غير محدد" أو فارغة
    if (!teacherValue || teacherValue === "غير محدد") {
      return "غير محدد";
    }

    // إذا كانت القيمة اسم كامل (من Backend) - يحتوي على مسافة
    if (teacherValue.includes(" ")) {
      return teacherValue;
    }

    // إذا كانت ID، ابحث في قائمة المعلمين
    const teacher = teachers.find((t) => t._id === teacherValue);
    if (teacher) {
      return `${teacher.firstName} ${teacher.lastName}`;
    }

    return "غير محدد";
  };

  const renderGroup = ({ item }: { item: Group }) => {
    const isSelected = selectedGroups.has(item._id || "");
    const percentage = item.capacityPercentage || 0;
    const current = item.currentStudents || 0;
    const capacity = item.capacity || 30;

    return (
      <TouchableOpacity
        onPress={() => onEdit(item)}
        onLongPress={() => onToggleSelection(item._id || "")}
        activeOpacity={0.7}
        className={`bg-white rounded-2xl p-5 mb-4 shadow-lg border-2 ${
          isSelected ? "border-emerald-500" : "border-gray-200"
        }`}>
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 mb-2">
              {item.name}
            </Text>
            <View className="flex-row items-center gap-2">
              <View
                className={`px-3 py-1 rounded-full ${
                  item.activeStatus
                    ? "bg-emerald-100 border border-emerald-300"
                    : "bg-gray-100 border border-gray-300"
                }`}>
                <Text
                  className={`text-xs font-bold ${
                    item.activeStatus ? "text-emerald-700" : "text-gray-600"
                  }`}>
                  {item.activeStatus ? "فعالة" : "غير فعالة"}
                </Text>
              </View>
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

        {/* Teacher Info */}
        <View className="bg-gray-50 rounded-xl p-3 mb-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl">👨‍🏫</Text>
            <Text className="text-gray-700 font-semibold">
              {item.teacherName || getTeacherName(item.teacher)}
            </Text>
          </View>
        </View>

        {/* Capacity Progress */}
        <View className="mb-2">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">عدد الطلاب</Text>
            <Text className="text-sm font-bold text-gray-900">
              {current} / {capacity}
            </Text>
          </View>
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className={`h-full rounded-full ${
                percentage >= 90
                  ? "bg-red-500"
                  : percentage >= 70
                    ? "bg-orange-500"
                    : "bg-emerald-500"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </View>
        </View>

        {/* Description */}
        {item.description && (
          <View className="bg-blue-50 rounded-lg p-3 mt-2">
            <Text className="text-gray-700 text-sm">{item.description}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (groups.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-6xl mb-4">👥</Text>
        <Text className="text-gray-500 text-lg">لا توجد حلقات</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={groups}
      renderItem={renderGroup}
      keyExtractor={(item) => item._id || ""}
      contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
};
