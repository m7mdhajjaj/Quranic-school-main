// ============================================================================
// useTeachersActions - Hook لإدارة العمليات على المعلمين
// ============================================================================

import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { deleteTeacher } from "@/Api/teacherApi";
import type { Teacher } from "@/types/teacher.types";

export const useTeachersActions = (
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>,
  fetchTeachers: () => Promise<void>
) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(
    new Set()
  );

  // Handle delete
  const handleDelete = useCallback(
    async (teacherId: string) => {
      Alert.alert("تأكيد حذف المعلم", "هل أنت متأكد من حذف هذا المعلم؟", [
        {
          text: "إلغاء",
          style: "cancel",
        },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteTeacher(teacherId);

              if (result.success) {
                setTeachers((prevTeachers) =>
                  prevTeachers.filter((t) => t._id !== teacherId)
                );
                Alert.alert("نجاح", "تم حذف المعلم بنجاح");
              } else {
                Alert.alert(
                  "خطأ",
                  result.message || "حدث خطأ أثناء حذف المعلم"
                );
              }
            } catch (error: any) {
              console.error("❌ فشل في حذف المعلم:", error);
              Alert.alert("خطأ", error?.message || "حدث خطأ أثناء حذف المعلم");
            }
          },
        },
      ]);
    },
    [setTeachers]
  );

  // Handle edit
  const handleEdit = useCallback((teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsEditMode(true);
    setIsFormVisible(true);
  }, []);

  // Handle add/edit success
  const handleAddSuccess = useCallback(async () => {
    try {
      console.log("تمت العملية بنجاح");
      await fetchTeachers();
      setIsFormVisible(false);
      setIsEditMode(false);
      setSelectedTeacher(null);
    } catch (error) {
      console.error("خطأ في حفظ المعلم:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء حفظ بيانات المعلم");
    }
  }, [fetchTeachers]);

  // Bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedTeachers.size === 0) return;

    Alert.alert(
      `حذف ${selectedTeachers.size} معلم`,
      "هل أنت متأكد من حذف المعلمين المحددين؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف الكل",
          style: "destructive",
          onPress: async () => {
            try {
              await Promise.all(
                Array.from(selectedTeachers).map((id) => deleteTeacher(id))
              );

              setTeachers((prev) =>
                prev.filter((t) => !selectedTeachers.has(t._id || ""))
              );
              setSelectedTeachers(new Set());

              Alert.alert("نجاح", `تم حذف ${selectedTeachers.size} معلم بنجاح`);
            } catch (error) {
              console.error("❌ فشل في حذف المعلمين:", error);
              Alert.alert("خطأ", "حدث خطأ أثناء حذف المعلمين");
            }
          },
        },
      ]
    );
  }, [selectedTeachers, setTeachers]);

  // Toggle teacher selection
  const toggleTeacherSelection = useCallback(
    (teacherId: string) => {
      const newSelected = new Set(selectedTeachers);
      if (newSelected.has(teacherId)) {
        newSelected.delete(teacherId);
      } else {
        newSelected.add(teacherId);
      }
      setSelectedTeachers(newSelected);
    },
    [selectedTeachers]
  );

  // Select all teachers
  const selectAllTeachers = useCallback((currentTeachers: Teacher[]) => {
    setSelectedTeachers((prevSelected) => {
      if (prevSelected.size === currentTeachers.length) {
        return new Set();
      } else {
        return new Set(currentTeachers.map((t) => t._id || ""));
      }
    });
  }, []);

  return {
    isFormVisible,
    setIsFormVisible,
    isEditMode,
    setIsEditMode,
    selectedTeacher,
    setSelectedTeacher,
    selectedTeachers,
    handleDelete,
    handleEdit,
    handleAddSuccess,
    handleBulkDelete,
    toggleTeacherSelection,
    selectAllTeachers,
  };
};
