import { useState } from "react";
import { deleteStudent, bulkDeleteStudents, exportStudentsToCSV } from "@/Api/studentApi";
import {
  showCenteredSwal,
  showWarningMessage,
  showErrorMessage,
} from "@/utils/sweetalertUtils";
import { showSuccessToast } from "@/utils/toastUtils";
import type { Student } from "../types";

export const useStudentsActions = (
  students: Student[],
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>,
  fetchStudents: () => Promise<void>
) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set()
  );

  // Handle delete - Optimized
  const handleDelete = async (studentId: string | number) => {
    // Early validation
    if (typeof studentId !== "string" || studentId.length <= 10) {
      console.error("Invalid student ID");
      return;
    }

    const student = students.find((s) => s._id === studentId);
    const studentName = student
      ? `${student.firstName} ${student.lastName}`
      : "الطالب";

    const result = await showCenteredSwal({
      title: "حذف الطالب",
      text: `هل تريد حذف "${studentName}" نهائياً؟`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "حذف",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: "rounded-2xl shadow-2xl",
        title: "text-xl font-semibold text-gray-800",
        confirmButton: "rounded-lg px-6 py-2 font-medium",
        cancelButton: "rounded-lg px-6 py-2 font-medium",
      },
    });

    if (result.isConfirmed) {
      try {
        const deleteResult = await deleteStudent(studentId);
        
        if (!deleteResult.success) {
          throw new Error(deleteResult.message || "فشل في حذف الطالب");
        }

        // Update state optimistically
        setStudents((prev) => prev.filter((s) => s._id !== studentId));
        showSuccessToast(`✅ تم حذف الطالب ${studentName} من النظام بنجاح`);
      } catch (deleteError) {
        console.error("❌ فشل في حذف الطالب:", deleteError);
        await showErrorMessage(
          "خطأ في الحذف!",
          "حدث خطأ أثناء حذف الطالب. يرجى المحاولة مرة أخرى"
        );
      }
    }
  };

  // Handle edit
  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditMode(true);
    setIsFormVisible(true);
  };

  // Handle add/edit success
  const handleAddSuccess = async () => {
    try {
      setIsFormVisible(false);
      setIsEditMode(false);
      setSelectedStudent(null);

      await fetchStudents();
    } catch (error: unknown) {
      console.error("❌ خطأ في معالجة نجاح إضافة الطالب:", error);

      const errorMessage = "حدث خطأ أثناء إعادة تحميل البيانات";

      // عرض SweetAlert للفشل
      await showWarningMessage(
        "تحذير ⚠️",
        `${errorMessage} - يرجى تحديث الصفحة يدوياً`
      );
    }
  };

  // Export to CSV - now uses backend endpoint
  const handleExport = async (filters?: any) => {
    try {
      await exportStudentsToCSV(filters);
      showSuccessToast("✅ تم تصدير البيانات بنجاح");
    } catch (error) {
      console.error("❌ فشل في تصدير البيانات:", error);
      await showErrorMessage(
        "خطأ في التصدير!",
        "حدث خطأ أثناء تصدير البيانات. يرجى المحاولة مرة أخرى"
      );
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedStudents.size === 0) return;

    const result = await showCenteredSwal({
      title: "حذف متعدد",
      text: `هل تريد حذف ${selectedStudents.size} طالب نهائياً؟`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "حذف الكل",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: "rounded-2xl shadow-2xl",
        title: "text-xl font-semibold text-gray-800",
        confirmButton: "rounded-lg px-6 py-2 font-medium",
        cancelButton: "rounded-lg px-6 py-2 font-medium",
      },
    });

    if (result.isConfirmed) {
      try {
        const studentIds = Array.from(selectedStudents);
        const bulkDeleteResult = await bulkDeleteStudents(studentIds);

        if (bulkDeleteResult.success) {
          const deletedCount = selectedStudents.size;
          setStudents((prev) =>
            prev.filter((s) => !selectedStudents.has(s._id || ""))
          );
          setSelectedStudents(new Set());

          // عرض Toast للنجاح
          showSuccessToast(
            `✅ تم حذف ${deletedCount} طالب من النظام بنجاح`
          );
        } else {
          throw new Error(bulkDeleteResult.message || "فشل في حذف الطلاب");
        }
      } catch (bulkDeleteError) {
        console.error("❌ فشل في حذف الطلاب:", bulkDeleteError);

        // عرض SweetAlert للفشل
        await showErrorMessage(
          "فشل في الحذف!",
          "حدث خطأ أثناء حذف الطلاب المحددين. يرجى المحاولة مرة أخرى"
        );
      }
    }
  };

  return {
    isFormVisible,
    setIsFormVisible,
    isEditMode,
    setIsEditMode,
    selectedStudent,
    setSelectedStudent,
    selectedStudents,
    setSelectedStudents,
    handleDelete,
    handleEdit,
    handleAddSuccess,
    handleExport,
    handleBulkDelete,
  };
};
