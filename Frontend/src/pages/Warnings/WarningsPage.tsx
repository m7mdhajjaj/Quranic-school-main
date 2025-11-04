// ============================================================================
// WarningsPage - الصفحة الرئيسية للإنذارات
// ============================================================================

import { useState } from "react";
import { useWarningsSocket } from "@/Socket/useWarningsSocket";
import { useWarningsData } from "./hooks/useWarningsData";
import { useWarningsActions } from "./hooks/useWarningsActions";
import { TeacherView } from "./TeacherView";
import { StudentView } from "./StudentView";
import type { Group, Student, WarningType } from "./types/warnings";
import Swal from "sweetalert2";
import {
  getWarningTitle,
  getWarningLabel,
  getWarningDescription,
} from "./utils/warningHelpers";

const WarningsPage = () => {
  const {
    user,
    groups,
    warnings,
    loading,
    isTeacher,
    isStudent,
    refetchData,
    fetchGroupStudentsWarnings,
    setWarnings,
  } = useWarningsData();

  const {
    statistics,
    loadingStatistics,
    fetchTeacherStatistics,
    giveWarning,
    deleteWarning,
    deleteWarningById,
  } = useWarningsActions(refetchData);

  const [showStatistics, setShowStatistics] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Socket للتحديثات الفورية
  useWarningsSocket(
    (newWarning) => {
      console.log("New warning received:", newWarning);
      if (isStudent && newWarning.studentId._id === user?._id) {
        setWarnings((prev) => [newWarning, ...prev]);
      } else if (
        isTeacher &&
        selectedGroup &&
        newWarning.groupId._id === selectedGroup._id
      ) {
        handleGroupSelect(selectedGroup);
      }
    },
    (deletedWarningId) => {
      console.log("Warning deleted:", deletedWarningId);
      setWarnings((prev) => prev.filter((w) => w._id !== deletedWarningId));
    }
  );

  // التعامل مع اختيار الحلقة
  const handleGroupSelect = async (group: Group) => {
    const updatedGroup = await fetchGroupStudentsWarnings(group);
    if (updatedGroup) {
      setSelectedGroup(updatedGroup);
    }
  };

  // العودة للحلقات
  const handleBack = () => {
    setSelectedGroup(null);
  };

  // عرض الإحصائيات
  const handleShowStatistics = async () => {
    const stats = await fetchTeacherStatistics();
    if (stats) {
      setShowStatistics(true);
    }
  };

  // إعطاء إنذار للطالب
  const handleGiveWarning = async (student: Student, type: WarningType) => {
    const result = await Swal.fire({
      title: getWarningTitle(type),
      html: `
        <div class="text-right" dir="rtl">
          <p class="text-lg mb-4">هل أنت متأكد من إعطاء <strong>${getWarningLabel(
            type
          )}</strong> للطالب:</p>
          <p class="text-xl font-bold text-blue-600">${student.firstName} ${
        student.lastName
      }</p>
          <p class="text-sm text-gray-600 mt-4">${getWarningDescription(
            type
          )}</p>
          <textarea id="reason" class="swal2-textarea mt-4 w-full" placeholder="اكتب سبب الإنذار..." rows="3"></textarea>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، أعطِ الإنذار",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      preConfirm: () => {
        const reason = (
          document.getElementById("reason") as HTMLTextAreaElement
        )?.value;
        if (!reason || reason.trim() === "") {
          Swal.showValidationMessage("يرجى كتابة سبب الإنذار");
          return false;
        }
        return reason;
      },
    });

    if (result.isConfirmed && result.value) {
      Swal.fire({
        title: "جاري إضافة الإنذار...",
        html: `
          <div class="text-center py-4" dir="rtl">
            <div class="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
            <p class="text-lg text-gray-700 font-medium">الرجاء الانتظار قليلاً...</p>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
      });

      const success = await giveWarning(
        student,
        type,
        result.value,
        selectedGroup?.name || "",
        user?._id || ""
      );

      if (success && selectedGroup) {
        Swal.fire({
          icon: "success",
          title: "✅ تم بنجاح!",
          html: `
            <div class="text-center" dir="rtl">
              <p class="text-lg text-gray-700">تم إعطاء <strong class="text-red-600">${getWarningLabel(
                type
              )}</strong> للطالب</p>
              <p class="text-sm text-gray-500 mt-2">${student.firstName} ${
            student.lastName
          }</p>
            </div>
          `,
          confirmButtonColor: "#10b981",
          confirmButtonText: "حسناً",
          timer: 3000,
        });

        handleGroupSelect(selectedGroup);
      }
    }
  };

  // حذف إنذار
  const handleDeleteWarning = async (student: Student, warningType: string) => {
    const result = await Swal.fire({
      title: "⚠️ حذف الإنذار",
      html: `
        <div class="text-right" dir="rtl">
          <p class="text-lg mb-4">هل أنت متأكد من حذف <strong class="text-red-600">${getWarningLabel(
            warningType
          )}</strong>؟</p>
          <p class="text-xl font-bold text-blue-600 mb-4">${
            student.firstName
          } ${student.lastName}</p>
          <p class="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">
            ⚠️ تحذير: سيتم حذف الإنذار نهائياً ولن يمكن استرجاعه
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف الإنذار",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "جاري حذف الإنذار...",
        html: `
          <div class="text-center py-4" dir="rtl">
            <div class="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
            <p class="text-lg text-gray-700 font-medium">الرجاء الانتظار...</p>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
      });

      const success = await deleteWarning(student, warningType);

      if (success && selectedGroup) {
        Swal.fire({
          icon: "success",
          title: "✅ تم الحذف!",
          html: `
            <div class="text-center" dir="rtl">
              <p class="text-lg text-gray-700">تم حذف <strong class="text-red-600">${getWarningLabel(
                warningType
              )}</strong> بنجاح</p>
              <p class="text-sm text-gray-500 mt-2">${student.firstName} ${
            student.lastName
          }</p>
            </div>
          `,
          confirmButtonColor: "#10b981",
          confirmButtonText: "حسناً",
          timer: 3000,
        });

        handleGroupSelect(selectedGroup);
      }
    }
  };

  // حذف تنبيه محدد
  const handleDeleteWarningById = async (
    warningId: string,
    student: Student
  ) => {
    const warning = student.allWarnings?.find((w) => w._id === warningId);

    if (!warning) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "لم يتم العثور على التنبيه",
      });
      return;
    }

    const result = await Swal.fire({
      title: "⚠️ حذف التنبيه",
      html: `
        <div class="text-right" dir="rtl">
          <p class="text-lg mb-4">هل أنت متأكد من حذف هذا التنبيه؟</p>
          <p class="text-xl font-bold text-blue-600 mb-2">${
            student.firstName
          } ${student.lastName}</p>
          <div class="bg-yellow-50 p-3 rounded-lg text-right mb-4">
            <p class="text-sm text-gray-700"><strong>السبب:</strong> ${
              warning.reason
            }</p>
            <p class="text-xs text-gray-500 mt-1">
              التاريخ: ${new Date(warning.createdAt).toLocaleDateString(
                "ar-EG"
              )}
            </p>
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "جاري الحذف...",
        html: `
          <div class="text-center py-4" dir="rtl">
            <div class="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-600 mb-4"></div>
            <p class="text-lg text-gray-700 font-medium">الرجاء الانتظار...</p>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
      });

      const success = await deleteWarningById(warningId);

      if (success && selectedGroup) {
        Swal.fire({
          icon: "success",
          title: "✅ تم الحذف!",
          text: "تم حذف التنبيه بنجاح",
          confirmButtonColor: "#10b981",
          confirmButtonText: "حسناً",
          timer: 2000,
        });

        handleGroupSelect(selectedGroup);
      }
    }
  };

  // عرض واجهة المعلم
  if (isTeacher) {
    return (
      <TeacherView
        groups={groups}
        loading={loading}
        selectedGroup={selectedGroup}
        onGroupSelect={handleGroupSelect}
        onBack={handleBack}
        onShowStatistics={handleShowStatistics}
        statistics={statistics}
        showStatistics={showStatistics}
        loadingStatistics={loadingStatistics}
        onCloseStatistics={() => setShowStatistics(false)}
        onGiveWarning={handleGiveWarning}
        onDeleteWarning={handleDeleteWarning}
        onDeleteWarningById={handleDeleteWarningById}
      />
    );
  }

  // عرض واجهة الطالب
  if (isStudent) {
    return <StudentView warnings={warnings} loading={loading} />;
  }

  // غير مصرح
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-6xl mb-4">🚫</div>
        <p className="text-gray-600 text-lg">غير مصرح لك بالوصول لهذه الصفحة</p>
      </div>
    </div>
  );
};

export default WarningsPage;
