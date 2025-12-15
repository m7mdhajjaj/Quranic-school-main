import { useState, useCallback } from "react";
import { deleteStudent } from "@/Api/studentApi";
import type { Student } from "@/Api/studentApi";

interface UseStudentManagementProps {
  onRefetchGroups: () => void;
  selectedGroupId?: string | null;
  groups?: Array<{ _id: string; currentStudents?: number; totalStudents?: number }>;
}

export const useStudentManagement = ({ 
  onRefetchGroups, 
  selectedGroupId,
  groups 
}: UseStudentManagementProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleAddStudent = useCallback(() => {
    setSelectedStudent(undefined);
    setIsEditMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEditStudent = useCallback((student: Student) => {
    setSelectedStudent(student);
    setIsEditMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteStudent = useCallback(async (studentId: string) => {
    try {
      // التحقق من عدد الطلاب قبل الحذف
      const currentGroup = groups?.find(g => g._id === selectedGroupId);
      const willBeEmpty = (currentGroup?.currentStudents || currentGroup?.totalStudents || 0) <= 1;
      
      const result = await deleteStudent(studentId);
      if (result.success) {
        // إذا كانت الحلقة ستصبح فارغة، إظهار رسالة
        if (willBeEmpty) {
          alert("تم حذف الطالب. الحلقة أصبحت فارغة وتم تعطيلها تلقائياً.");
        }
        
        // إعادة تحميل الحلقات والطلاب
        onRefetchGroups();
      } else {
        alert(result.message || "فشل في حذف الطالب");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("حدث خطأ أثناء حذف الطالب");
    }
  }, [selectedGroupId, groups, onRefetchGroups]);

  const handleFormSuccess = useCallback(() => {
    // إعادة تحميل البيانات
    onRefetchGroups();
    setIsFormOpen(false);
    setSelectedStudent(undefined);
    setIsEditMode(false);
  }, [onRefetchGroups]);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedStudent(undefined);
    setIsEditMode(false);
  }, []);

  return {
    isFormOpen,
    selectedStudent,
    isEditMode,
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    handleFormSuccess,
    closeForm,
  };
};
