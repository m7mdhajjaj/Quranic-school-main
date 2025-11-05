import { useState } from "react";
import { deleteTeacher } from "@/Api/teacherApi";
import {
  showCenteredSwal,
  showSuccessMessage,
  showErrorMessage,
} from "@/components/utils/sweetalertUtils";
import { useSounds } from "@/components/Hooks/useSounds";
import type { Teacher } from "../types";

export const useTeachersActions = (
  teachers: Teacher[],
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>,
  fetchTeachers: () => Promise<void>
) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(
    new Set()
  );

  const { playAdd, playUpdate, playDelete, playError } = useSounds();

  // Handle delete
  const handleDelete = async (teacherId: string) => {
    const teacher = teachers.find((t) => t._id === teacherId);
    const teacherName = teacher
      ? `${teacher.firstName} ${teacher.lastName}`
      : "المعلم";

    const result = await showCenteredSwal({
      title: "حذف المعلم",
      text: `هل تريد حذف "${teacherName}" نهائياً؟`,
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
        const deleteResult = await deleteTeacher(teacherId);

        if (deleteResult.success) {
          setTeachers((prevTeachers) =>
            prevTeachers.filter((t) => t._id !== teacherId)
          );

          playDelete();

          await showSuccessMessage(
            "تم الحذف!",
            `تم حذف المعلم ${teacherName} من النظام بنجاح`
          );
        } else {
          throw new Error(deleteResult.message || "فشل في حذف المعلم");
        }
      } catch (deleteError: unknown) {
        console.error("❌ فشل في حذف المعلم:", deleteError);

        playError();

        const error = deleteError as {
          response?: {
            status: number;
            data: {
              details: { groupsCount: number; studentsCount: number };
              message: string;
            };
          };
        };

        if (error.response?.status === 400 && error.response?.data?.details) {
          const { groupsCount, studentsCount } = error.response.data.details;

          await showCenteredSwal({
            title: "⚠️ لا يمكن حذف المعلم ⚠️",
            html: `
              <div class="text-center py-4">
                <div class="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <svg class="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <p class="text-lg font-semibold text-gray-800 mb-2">المعلم مرتبط بـ:</p>
                <div class="text-xl font-bold text-orange-600 mb-2">
                  ${groupsCount > 0 ? `📚 ${groupsCount} حلقة` : ""}
                  ${groupsCount > 0 && studentsCount > 0 ? "<br>" : ""}
                  ${studentsCount > 0 ? `👥 ${studentsCount} طالب` : ""}
                </div>
                <p class="text-sm text-gray-600 mb-2">يجب نقل الحلقات والطلاب أولاً</p>
                <p class="text-xs text-yellow-600">أو تعيين معلم آخر لهم</p>
              </div>
            `,
            icon: "warning",
            timer: 7000,
            timerProgressBar: true,
            showConfirmButton: true,
            confirmButtonText: "فهمت",
            customClass: {
              popup: "rtl-popup swal2-rtl-popup swal2-center-popup",
              title: "rtl-title",
              htmlContainer: "rtl-content",
            },
          });
        } else {
          await showErrorMessage(
            "خطأ!",
            error.response?.data?.message || "حدث خطأ أثناء حذف المعلم"
          );
        }
      }
    }
  };

  // Handle edit
  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsEditMode(true);
    setIsFormVisible(true);
  };

  // Handle add/edit success
  const handleAddSuccess = async (teacherData?: unknown) => {
    try {
      if (teacherData && typeof teacherData === "object") {
        if (isEditMode && selectedTeacher) {
          setTeachers((prev) =>
            prev.map((t) =>
              t._id === selectedTeacher._id
                ? ({ ...t, ...teacherData } as Teacher)
                : t
            )
          );

          playUpdate();

          await showSuccessMessage(
            "تم التحديث!",
            `تم تحديث بيانات ${
              "firstName" in teacherData && teacherData.firstName
                ? teacherData.firstName
                : "المعلم"
            } بنجاح`
          );
        } else {
          await fetchTeachers();

          playAdd();

          await showSuccessMessage(
            "مرحباً بالمعلم الجديد!",
            `أهلاً وسهلاً! تم إضافة ${
              "firstName" in teacherData && teacherData.firstName
                ? teacherData.firstName
                : "المعلم الجديد"
            } إلى فريق العمل بنجاح`
          );
        }
      }

      setIsFormVisible(false);
      setIsEditMode(false);
      setSelectedTeacher(null);
    } catch (error: unknown) {
      console.error("خطأ في handleAddSuccess:", error);

      playError();

      let errorMessage = "حدث خطأ أثناء معالجة بيانات المعلم";
      let errorTitle = "حدث خطأ! ⚠️";

      if (error && typeof error === "object") {
        const apiError = error as {
          response?: { data?: { message?: string } };
        };

        if (apiError.response?.data?.message) {
          const msg = apiError.response.data.message;

          if (msg.includes("رقم الهوية")) {
            errorTitle = "رقم هوية مكرر! 🚫";
            errorMessage =
              "رقم الهوية موجود بالفعل في النظام. يرجى استخدام رقم هوية مختلف.";
          } else if (
            msg.includes("رقم الهاتف") ||
            msg.includes("phoneNumber")
          ) {
            errorTitle = "رقم هاتف مكرر! 📱";
            errorMessage =
              "رقم الهاتف موجود بالفعل في النظام. يرجى استخدام رقم هاتف مختلف.";
          } else if (
            msg.includes("البريد الإلكتروني") ||
            msg.includes("email")
          ) {
            errorTitle = "بريد إلكتروني مكرر! 📧";
            errorMessage =
              "البريد الإلكتروني موجود بالفعل في النظام. يرجى استخدام بريد إلكتروني مختلف.";
          } else {
            errorMessage = msg;
          }
        }
      }

      await showErrorMessage(errorTitle, errorMessage);
    }
  };

  // Export to CSV
  const handleExport = (filteredTeachers: Teacher[]) => {
    const headers = [
      "رقم المعلم",
      "الاسم الأول",
      "اسم الأب",
      "اسم العائلة",
      "البريد الإلكتروني",
      "رقم الهاتف",
      "العمر",
      "الجنس",
    ];
    const rows = filteredTeachers.map((t) => [
      t.teacherId,
      t.firstName,
      t.fatherName || "",
      t.lastName,
      t.email,
      t.phoneNumber,
      t.age || "",
      t.gender || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `teachers_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedTeachers.size === 0) return;

    const teachersCount = selectedTeachers.size;
    const teachersText =
      teachersCount === 1 ? "معلم واحد" : `${teachersCount} معلم`;

    const result = await showCenteredSwal({
      title: "حذف متعدد",
      text: `هل تريد حذف ${teachersText} نهائياً؟`,
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
        await Promise.all(
          Array.from(selectedTeachers).map((id) => deleteTeacher(id))
        );

        setTeachers((prev) => prev.filter((t) => !selectedTeachers.has(t._id)));
        setSelectedTeachers(new Set());

        playDelete();

        await showSuccessMessage(
          "تم الحذف بنجاح! 🎉",
          `تم حذف ${teachersText} من النظام بنجاح`
        );
      } catch (bulkDeleteError) {
        console.error("❌ فشل في حذف المعلمين:", bulkDeleteError);

        playError();

        await showErrorMessage(
          "❌ فشل في العملية",
          "حدث خطأ أثناء حذف المعلمين - يرجى المحاولة مرة أخرى"
        );
      }
    }
  };

  return {
    isFormVisible,
    setIsFormVisible,
    isEditMode,
    setIsEditMode,
    selectedTeacher,
    setSelectedTeacher,
    selectedTeachers,
    setSelectedTeachers,
    handleDelete,
    handleEdit,
    handleAddSuccess,
    handleExport,
    handleBulkDelete,
  };
};
