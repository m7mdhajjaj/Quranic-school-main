// ============================================================================
// Students Management Screen - شاشة إدارة الطلاب
// ============================================================================

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { useStudentsData } from "@/hooks/students/useStudentsData";
import { useStudentsStats } from "@/hooks/students/useStudentsStats";
import { useStudentsActions } from "@/hooks/students/useStudentsActions";
import { StudentsList } from "@/components/students/StudentsList";
import { StudentsStatsCards } from "@/components/students/StudentsStatsCards";
import { AddStudentModal } from "@/components/students/AddStudentModal";
import type { Student } from "@/types/student.types";

export default function StudentsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();

  // Hooks
  const {
    students,
    loading: loadingStudents,
    refetch: refetchStudents,
  } = useStudentsData({ search: searchQuery });

  const { stats, loading: loadingStats } = useStudentsStats();

  const { deleteStudent } = useStudentsActions();

  // Handlers
  const handleAddStudent = () => {
    setSelectedStudent(undefined);
    setShowAddModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowAddModal(true);
  };

  const handleDeleteStudent = (student: Student) => {
    Alert.alert(
      "تأكيد الحذف",
      `هل أنت متأكد من حذف الطالب ${student.firstName} ${student.lastName}؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            const result = await deleteStudent(student._id);
            if (result.success) {
              Alert.alert("نجح", "تم حذف الطالب بنجاح");
              refetchStudents();
            } else {
              Alert.alert("خطأ", result.message || "فشل حذف الطالب");
            }
          },
        },
      ]
    );
  };

  const handleModalSuccess = () => {
    setShowAddModal(false);
    setSelectedStudent(undefined);
    refetchStudents();
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-6 px-6">
        <Text className="text-black text-3xl font-bold mb-2">إدارة الطلاب</Text>
        <Text className="text-blue-100 text-sm">
          إدارة وتنظيم بيانات الطلاب
        </Text>
      </View>

      {/* Content */}
      <FlatList
        ListHeaderComponent={
          <>
            {/* Stats Cards */}
            <View className="px-6 py-4">
              <StudentsStatsCards stats={stats} loading={loadingStats} />
            </View>

            {/* Search & Add */}
            <View className="px-6 pb-4">
              <View className="flex-row gap-3">
                {/* Search */}
                <View className="flex-1 bg-white rounded-xl px-4 py-3 border border-gray-200 flex-row items-center">
                  <Text className="text-gray-400 mr-2">🔍</Text>
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="ابحث عن طالب..."
                    className="flex-1 text-gray-800"
                  />
                </View>

                {/* Add Button */}
                <TouchableOpacity
                  onPress={handleAddStudent}
                  className="bg-blue-500 rounded-xl px-6 py-3 justify-center">
                  <Text className="text-white font-bold text-lg">+ إضافة</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Students List Header */}
            <View className="px-6 pb-2">
              <Text className="text-gray-700 font-bold text-lg">
                قائمة الطلاب ({students.length})
              </Text>
            </View>
          </>
        }
        data={students}
        renderItem={({ item }) => null}
        keyExtractor={(item) => item._id}
        ListFooterComponent={
          <View className="px-6">
            <StudentsList
              students={students}
              loading={loadingStudents}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
            />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Add/Edit Modal */}
      <AddStudentModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedStudent(undefined);
        }}
        onSuccess={handleModalSuccess}
        student={selectedStudent}
      />
    </View>
  );
}
