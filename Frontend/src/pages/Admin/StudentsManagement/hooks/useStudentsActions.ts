import { useState } from "react";
import { deleteStudent, bulkDeleteStudents } from "@/Api/studentApi";
import {
  showCenteredSwal,
  showSuccessMessage,
  showWarningMessage,
  showErrorMessage,
} from "@/components/utils/sweetalertUtils";
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

  // Handle delete
  const handleDelete = async (studentId: string | number) => {
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
        if (typeof studentId === "string" && studentId.length > 10) {
          const deleteResult = await deleteStudent(studentId);
          if (deleteResult.success) {
            setStudents((prev) => prev.filter((s) => s._id !== studentId));

            await showSuccessMessage(
              "تم الحذف!",
              `تم حذف الطالب ${studentName} من النظام بنجاح`
            );
          } else {
            throw new Error(deleteResult.message || "فشل في حذف الطالب");
          }
        }
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
  const handleAddSuccess = async (studentData?: unknown) => {
    try {
      setIsFormVisible(false);
      setIsEditMode(false);
      setSelectedStudent(null);

      await fetchStudents();

      if (
        !isEditMode &&
        studentData &&
        typeof studentData === "object" &&
        "firstName" in studentData
      ) {
        await showSuccessMessage(
          "مرحباً بالطالب الجديد!",
          `أهلاً وسهلاً! تم إضافة ${
            studentData.firstName || "الطالب الجديد"
          } إلى المدرسة بنجاح`
        );
      }
    } catch (error: unknown) {
      console.error("❌ خطأ في معالجة نجاح إضافة الطالب:", error);

      const errorMessage = "حدث خطأ أثناء إعادة تحميل البيانات";

      await showWarningMessage(
        "تحذير ⚠️",
        `${errorMessage} - يرجى تحديث الصفحة يدوياً`
      );
    }
  };

  // Export to CSV
  const handleExport = (filteredStudents: Student[]) => {
    const headers = [
      "رقم الطالب",
      "الاسم الأول",
      "اسم الأب",
      "اسم العائلة",
      "رقم الهوية",
      "العمر",
      "الجنس",
      "المعلم",
      "الحلقة",
    ];
    const rows = filteredStudents.map((s) => [
      s.studentId,
      s.firstName,
      s.fatherName,
      s.lastName,
      s.idNumber,
      s.age,
      s.gender,
      s.teacher,
      s.group,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `students_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
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

          await showSuccessMessage(
            "تم حذف الطلاب!",
            `تم حذف ${deletedCount} طالب من النظام بنجاح`
          );
        } else {
          throw new Error(bulkDeleteResult.message || "فشل في حذف الطلاب");
        }
      } catch (bulkDeleteError) {
        console.error("❌ فشل في حذف الطلاب:", bulkDeleteError);

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
