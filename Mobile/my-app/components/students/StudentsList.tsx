// ============================================================================
// StudentsList - قائمة الطلاب
// ============================================================================

import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import type { Student } from "@/types/student.types";

interface StudentsListProps {
  students: Student[];
  loading: boolean;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  students,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center py-20">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-gray-600 mt-4">جاري تحميل الطلاب...</Text>
      </View>
    );
  }

  if (students.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-20">
        <Text className="text-6xl mb-4">📚</Text>
        <Text className="text-gray-600 text-lg font-semibold">
          لا يوجد طلاب
        </Text>
        <Text className="text-gray-400 text-sm mt-2">
          قم بإضافة طالب جديد للبدء
        </Text>
      </View>
    );
  }

  const renderStudent = ({ item }: { item: Student }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-lg font-bold text-gray-900">
              {item.firstName} {item.fatherName} {item.lastName}
            </Text>
            {item.isActive ? (
              <View className="bg-green-100 rounded-full px-2 py-0.5">
                <Text className="text-green-700 text-xs font-semibold">
                  نشط
                </Text>
              </View>
            ) : (
              <View className="bg-gray-100 rounded-full px-2 py-0.5">
                <Text className="text-gray-600 text-xs font-semibold">
                  غير نشط
                </Text>
              </View>
            )}
          </View>
          <Text className="text-gray-500 text-xs">#{item.studentId}</Text>
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
            <Text className="text-gray-500 text-xs mb-1">العمر</Text>
            <Text className="text-gray-800 font-semibold">
              {item.age ? `${item.age} سنة` : "-"}
            </Text>
          </View>
        </View>

        {/* Group & Teacher */}
        <View className="flex-row gap-2">
          <View className="flex-1 bg-gray-50 rounded-lg p-2">
            <Text className="text-gray-500 text-xs mb-1">الحلقة</Text>
            <Text className="text-gray-800 font-semibold" numberOfLines={1}>
              {item.group || "-"}
            </Text>
          </View>
          <View className="flex-1 bg-gray-50 rounded-lg p-2">
            <Text className="text-gray-500 text-xs mb-1">المعلم</Text>
            <Text className="text-gray-800 font-semibold" numberOfLines={1}>
              {item.teacherFullName || item.teacher || "-"}
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

        {/* Residence */}
        {item.residence && (
          <View className="bg-gray-50 rounded-lg p-2">
            <Text className="text-gray-500 text-xs mb-1">السكن</Text>
            <Text className="text-gray-800 font-semibold">
              {item.residence}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
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
    </View>
  );

  return (
    <FlatList
      data={students}
      renderItem={renderStudent}
      keyExtractor={(item) => item._id}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-4"
    />
  );
};
