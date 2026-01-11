import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import {
  Calendar,
  BookOpen,
  Edit,
  Trash2,
  Users,
  Award,
  Plus,
  BarChart3,
} from "lucide-react-native";
import { ExamWithMarks, Exam } from "@/types/exam.types";

interface TeacherViewProps {
  exams: ExamWithMarks[];
  onEdit: (exam: Exam) => void;
  onDelete: (examId: string) => void;
  onManageMarks: (exam: Exam) => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  exams,
  onEdit,
  onDelete,
  onManageMarks,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-EG", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const handleDelete = (examId: string, examName: string) => {
    Alert.alert("تأكيد الحذف", `هل أنت متأكد من حذف الامتحان "${examName}"؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => onDelete(examId),
      },
    ]);
  };

  const renderExamCard = ({ item }: { item: ExamWithMarks }) => {
    const isPast = new Date(item.date) < new Date();

    return (
      <View className="bg-white rounded-2xl p-5 mb-4 shadow-md border border-gray-100">
        {/* الرأس */}
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800 mb-1">
              {item.name}
            </Text>
            <View className="flex-row items-center gap-2 mb-2">
              <BookOpen size={16} color="#6b7280" />
              <Text className="text-gray-600 text-sm">{item.subject}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Calendar size={16} color="#059669" />
              <Text className="text-emerald-600 font-semibold text-sm">
                {formatDate(item.date)}
              </Text>
            </View>
          </View>
          <View
            className={`px-3 py-1.5 rounded-full ${
              item.examType === "تحريري" ? "bg-blue-100" : "bg-purple-100"
            }`}>
            <Text
              className={`text-xs font-bold ${
                item.examType === "تحريري" ? "text-blue-700" : "text-purple-700"
              }`}>
              {item.examType}
            </Text>
          </View>
        </View>

        {/* المعلومات الإحصائية */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-gray-50 rounded-xl p-3">
            <View className="flex-row items-center gap-2 mb-1">
              <Users size={16} color="#6b7280" />
              <Text className="text-gray-600 text-xs">الطلاب</Text>
            </View>
            <Text className="text-lg font-bold text-gray-800">
              {item.totalStudents || 0}
            </Text>
          </View>

          <View className="flex-1 bg-gray-50 rounded-xl p-3">
            <View className="flex-row items-center gap-2 mb-1">
              <Award size={16} color="#6b7280" />
              <Text className="text-gray-600 text-xs">العلامة الكلية</Text>
            </View>
            <Text className="text-lg font-bold text-gray-800">
              {item.totalMarks}
            </Text>
          </View>

          {item.averageMark !== undefined && (
            <View className="flex-1 bg-emerald-50 rounded-xl p-3 border border-emerald-200">
              <View className="flex-row items-center gap-2 mb-1">
                <BarChart3 size={16} color="#059669" />
                <Text className="text-emerald-700 text-xs">المتوسط</Text>
              </View>
              <Text className="text-lg font-bold text-emerald-600">
                {item.averageMark.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        {/* حالة العلامات */}
        {isPast && (
          <View
            className={`rounded-xl p-3 mb-4 ${
              item.marksEntered
                ? "bg-green-50 border border-green-200"
                : "bg-yellow-50 border border-yellow-200"
            }`}>
            <Text
              className={`text-sm font-semibold ${
                item.marksEntered ? "text-green-700" : "text-yellow-700"
              }`}>
              {item.marksEntered
                ? "✓ تم إدخال العلامات"
                : "⚠ لم يتم إدخال العلامات"}
            </Text>
          </View>
        )}

        {/* أزرار الإجراءات */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => onManageMarks(item)}
            className="flex-1 bg-emerald-500 rounded-xl py-3 flex-row items-center justify-center gap-2">
            <Award size={18} color="white" />
            <Text className="text-white font-bold">إدارة العلامات</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onEdit(item)}
            className="bg-blue-500 rounded-xl p-3">
            <Edit size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDelete(item._id, item.name)}
            className="bg-red-500 rounded-xl p-3">
            <Trash2 size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (exams.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Calendar size={64} color="#d1d5db" />
        <Text className="text-gray-500 text-lg mt-4">لا توجد امتحانات</Text>
        <Text className="text-gray-400 text-sm mt-2">
          استخدم زر + لإضافة امتحان جديد
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={exams}
      renderItem={renderExamCard}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    />
  );
};
