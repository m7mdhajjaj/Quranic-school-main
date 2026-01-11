import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Calendar, ClipboardList, Plus } from "lucide-react-native";
import { useAuth } from "@/Context/AuthContext";
import { useExamData } from "@/hooks/exam/useExamData";
import { useExamActions } from "@/hooks/exam/useExamActions";
import { StudentView } from "@/components/exam/StudentView";
import { TeacherView } from "@/components/exam/TeacherView";
import { FilterBar } from "@/components/exam/FilterBar";
import { ExamFormModal } from "@/components/exam/ExamFormModal";
import {
  Exam,
  ExamFilters,
  StudentExamResult,
  ExamWithMarks,
} from "@/types/exam.types";

export default function ExamScheduleScreen() {
  const { user } = useAuth();
  const role = user?.role || "student";
  const [activePage, setActivePage] = useState<"exams" | "marks">("exams");

  // الفلاتر
  const [filters, setFilters] = useState<ExamFilters>({
    query: "",
    dateFilter: "",
    typeFilter: "",
    marksFilter: "",
  });

  // حالة المودال
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // جلب البيانات
  const { exams, loading, refetch } = useExamData(filters);

  // إجراءات الامتحانات
  const { isSubmitting, handleCreateExam, handleUpdateExam, handleDeleteExam } =
    useExamActions(refetch);

  const handleFiltersChange = (newFilters: Partial<ExamFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleAddExam = () => {
    setEditingExam(null);
    setShowExamModal(true);
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setShowExamModal(true);
  };

  const handleDelete = (examId: string) => {
    handleDeleteExam(examId);
  };

  const handleManageMarks = (exam: Exam) => {
    // سيتم تنفيذه لاحقاً
    console.log("Manage marks:", exam);
  };

  const handleSubmitExam = async (data: any) => {
    if (editingExam) {
      await handleUpdateExam(editingExam._id, data);
    } else {
      await handleCreateExam(data);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="px-4 pt-6 pb-12">
          {/* العنوان */}
          <View className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 mb-6 shadow-lg">
            <View className="flex-row items-center gap-4 mb-2">
              <View className="bg-white/20 rounded-full p-3">
                <Calendar size={32} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-white">
                  جدول الامتحانات
                </Text>
              </View>
            </View>
            <Text className="text-white/90 text-sm mt-2">
              الامتحانات القادمة تظهر هنا، والنتائج تُعرض بعد التصحيح
            </Text>
          </View>

          {/* Segmented Control - للمعلمين فقط */}
          {role === "teacher" && (
            <View className="mb-6">
              <View className="bg-white rounded-xl shadow-lg border-2 border-emerald-200 p-1.5 flex-row">
                {/* زر صفحة الامتحانات */}
                <TouchableOpacity
                  onPress={() => setActivePage("exams")}
                  className={`flex-1 flex-row items-center justify-center gap-2 px-4 py-3 rounded-lg ${
                    activePage === "exams" ? "bg-emerald-500" : "bg-transparent"
                  }`}>
                  <Calendar
                    size={20}
                    color={activePage === "exams" ? "white" : "#374151"}
                  />
                  <Text
                    className={`font-bold ${
                      activePage === "exams" ? "text-white" : "text-gray-700"
                    }`}>
                    صفحة الامتحانات
                  </Text>
                </TouchableOpacity>

                {/* زر صفحة إدارة العلامات */}
                <TouchableOpacity
                  onPress={() => setActivePage("marks")}
                  className={`flex-1 flex-row items-center justify-center gap-2 px-4 py-3 rounded-lg ${
                    activePage === "marks" ? "bg-emerald-500" : "bg-transparent"
                  }`}>
                  <ClipboardList
                    size={20}
                    color={activePage === "marks" ? "white" : "#374151"}
                  />
                  <Text
                    className={`font-bold ${
                      activePage === "marks" ? "text-white" : "text-gray-700"
                    }`}>
                    إدارة العلامات
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* الفلاتر */}
          {activePage === "exams" && (
            <FilterBar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              showMarksFilter={role === "teacher"}
            />
          )}

          {/* المحتوى */}
          {loading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#10b981" />
              <Text className="text-gray-500 mt-4">جاري التحميل...</Text>
            </View>
          ) : activePage === "exams" ? (
            role === "student" ? (
              <StudentView exams={exams as StudentExamResult[]} />
            ) : (
              <TeacherView
                exams={exams as ExamWithMarks[]}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onManageMarks={handleManageMarks}
              />
            )
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <ClipboardList size={64} color="#d1d5db" />
              <Text className="text-gray-500 mt-4">
                إدارة العلامات - قريباً
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* زر الإضافة العائم - للمعلمين فقط */}
      {role === "teacher" && activePage === "exams" && (
        <TouchableOpacity
          onPress={handleAddExam}
          className="absolute bottom-8 left-6 bg-emerald-500 rounded-full p-4 shadow-2xl"
          style={{
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
          }}>
          <Plus size={28} color="white" />
        </TouchableOpacity>
      )}

      {/* مودال إضافة/تعديل الامتحان */}
      <ExamFormModal
        visible={showExamModal}
        onClose={() => {
          setShowExamModal(false);
          setEditingExam(null);
        }}
        onSubmit={handleSubmitExam}
        editingExam={editingExam}
        isSubmitting={isSubmitting}
      />
    </View>
  );
}
