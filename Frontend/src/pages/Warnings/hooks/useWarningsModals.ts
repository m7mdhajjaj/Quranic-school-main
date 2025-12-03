// ============================================================================
// useWarningsModals Hook - إدارة نوافذ SweetAlert للإنذارات
// ============================================================================

import Swal from "sweetalert2";
import type { Student, WarningType } from "../types/warnings";
import {
  getWarningTitle,
  getWarningLabel,
  getWarningDescription,
} from "../types/Constans";

interface UseWarningsModalsProps {
  giveWarning: (
    student: Student,
    type: WarningType,
    reason: string,
    groupName: string,
    teacherId: string
  ) => Promise<boolean>;
  deleteWarning: (student: Student, warningType: string) => Promise<boolean>;
  deleteWarningById: (warningId: string) => Promise<boolean>;
  selectedGroupName: string;
  teacherId: string;
  onSuccess?: () => void;
}

export const useWarningsModals = ({
  giveWarning,
  deleteWarning,
  deleteWarningById,
  selectedGroupName,
  teacherId,
  onSuccess,
}: UseWarningsModalsProps) => {
  // نافذة إعطاء إنذار
  const showGiveWarningModal = async (student: Student, type: WarningType) => {
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
      // نافذة التحميل
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
        selectedGroupName,
        teacherId
      );

      if (success) {
        // نافذة النجاح
        await Swal.fire({
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

        onSuccess?.();
      }
    }
  };

  // نافذة حذف إنذار
  const showDeleteWarningModal = async (
    student: Student,
    warningType: string
  ) => {
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
      // نافذة التحميل
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

      if (success) {
        // نافذة النجاح
        await Swal.fire({
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

        onSuccess?.();
      }
    }
  };

  // نافذة حذف تنبيه محدد
  const showDeleteWarningByIdModal = async (
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
      // نافذة التحميل
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

      if (success) {
        // نافذة النجاح
        await Swal.fire({
          icon: "success",
          title: "✅ تم الحذف!",
          text: "تم حذف التنبيه بنجاح",
          confirmButtonColor: "#10b981",
          confirmButtonText: "حسناً",
          timer: 2000,
        });

        onSuccess?.();
      }
    }
  };

  return {
    showGiveWarningModal,
    showDeleteWarningModal,
    showDeleteWarningByIdModal,
  };
};
