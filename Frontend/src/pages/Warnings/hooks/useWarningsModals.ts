// ============================================================================
// useWarningsModals Hook - إدارة نوافذ SweetAlert للإنذارات
// ============================================================================

import { useCallback } from "react";
import Swal from "sweetalert2";
import type { Student, WarningType } from "../types/warnings";
import {
  getWarningTitle,
  getWarningLabel,
  getWarningDescription,
} from "../types/Constans";
import { showConfirmMessage, showSuccessMessage, showErrorMessage, showCenteredSwal } from "@/components/utils/sweetalertUtils";

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
  // ✅ نافذة إعطاء إنذار - محسّن بـ useCallback
  const showGiveWarningModal = useCallback(async (student: Student, type: WarningType) => {
    const result = await showCenteredSwal({
      title: getWarningTitle(type),
      html: `
        <div class="text-right space-y-4" dir="rtl">
          <p class="text-base text-gray-700">هل أنت متأكد من إعطاء <strong class="text-red-600">${getWarningLabel(type)}</strong> للطالب:</p>
          <div class="bg-blue-50 p-3 rounded-lg border-r-4 border-blue-500">
            <p class="text-lg font-bold text-blue-600">${student.firstName} ${student.lastName}</p>
          </div>
          <p class="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border-r-4 border-yellow-400">${getWarningDescription(type)}</p>
          <textarea id="reason" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" placeholder="اكتب سبب الإنذار..." rows="3"></textarea>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، أعطِ الإنذار",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      customClass: {
        popup: "rtl:text-right !rounded-2xl",
        title: "!text-xl !font-bold !text-gray-800",
        htmlContainer: "!text-right",
        confirmButton: "!bg-gradient-to-r !from-red-600 !to-rose-700 hover:!from-red-700 hover:!to-rose-800 !text-white !font-bold !px-6 !py-3 !rounded-xl !shadow-lg hover:!shadow-xl !transition-all",
        cancelButton: "!bg-gradient-to-r !from-gray-500 !to-gray-600 hover:!from-gray-600 hover:!to-gray-700 !text-white !font-bold !px-6 !py-3 !rounded-xl !shadow-lg hover:!shadow-xl !transition-all",
      },
      preConfirm: () => {
        const reason = (document.getElementById("reason") as HTMLTextAreaElement)?.value;
        
        // التحقق من وجود السبب
        if (!reason || reason.trim() === "") {
          Swal.showValidationMessage("يرجى كتابة سبب الإنذار");
          return false;
        }
        
        // التحقق من طول السبب
        const reasonLength = reason.trim().length;
        if (reasonLength < 3) {
          Swal.showValidationMessage("سبب الإنذار يجب أن يكون على الأقل 3 أحرف");
          return false;
        }
        
        if (reasonLength > 500) {
          Swal.showValidationMessage("سبب الإنذار يجب أن لا يتجاوز 500 حرف");
          return false;
        }
        
        return reason;
      },
    });

    if (result.isConfirmed && result.value) {
      // معالجة النجاح أو الأخطاء من giveWarning
      try {
        await giveWarning(
          student,
          type,
          result.value,
          selectedGroupName,
          teacherId
        );

        // عرض رسالة النجاح
        await showSuccessMessage(
          "✅ تم بنجاح!",
          `تم إعطاء <strong class="text-red-600">${getWarningLabel(type)}</strong> بنجاح`,
          `${student.firstName} ${student.lastName}`
        );

        onSuccess?.();
      } catch (error: any) {
        // عرض رسالة الخطأ للمستخدم
        await showErrorMessage(
          "❌ فشلت العملية",
          error.message || "حدث خطأ أثناء إعطاء الإنذار"
        );
      }
    }
  }, [giveWarning, selectedGroupName, teacherId, onSuccess]);

  // ✅ نافذة حذف إنذار - محسّن بـ useCallback
  const showDeleteWarningModal = useCallback(async (
    student: Student,
    warningType: string
  ) => {
    const result = await showConfirmMessage(
      "⚠️ حذف الإنذار",
      `<div class="text-right space-y-4" dir="rtl">
         <p class="text-base text-gray-700">هل أنت متأكد من حذف <strong class="text-red-600">${getWarningLabel(warningType)}</strong>؟</p>
         <div class="bg-blue-50 p-3 rounded-lg border-r-4 border-blue-500">
           <p class="text-lg font-bold text-blue-600">${student.firstName} ${student.lastName}</p>
         </div>
         <div class="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg border-r-4 border-yellow-400">
           <p class="font-medium">⚠️ تحذير: سيتم حذف الإنذار نهائياً ولن يمكن استرجاعه</p>
         </div>
       </div>`,
      "نعم، احذف الإنذار",
      "إلغاء"
    );

    if (result.isConfirmed) {
      // تنفيذ الحذف مباشرة بدون نافذة تحميل منفصلة
      const success = await deleteWarning(student, warningType);

      if (success) {
        await showSuccessMessage(
          "✅ تم الحذف!",
          `تم حذف <strong class="text-red-600">${getWarningLabel(warningType)}</strong> بنجاح`,
          `${student.firstName} ${student.lastName}`
        );

        onSuccess?.();
      }
    }
  }, [deleteWarning, onSuccess]);

  // ✅ نافذة حذف تنبيه بالـ ID - محسّن بـ useCallback
  const showDeleteWarningByIdModal = useCallback(async (
    warningId: string,
    student: Student
  ) => {
    const warning = student.allWarnings?.find((w) => w._id === warningId);

    if (!warning) {
      showErrorMessage("خطأ", "لم يتم العثور على التنبيه");
      return;
    }

    const result = await showConfirmMessage(
      "⚠️ حذف التنبيه",
      `<div class="text-right space-y-4" dir="rtl">
         <p class="text-base text-gray-700">هل أنت متأكد من حذف هذا التنبيه؟</p>
         <div class="bg-blue-50 p-3 rounded-lg border-r-4 border-blue-500">
           <p class="text-lg font-bold text-blue-600">${student.firstName} ${student.lastName}</p>
         </div>
         <div class="bg-amber-50 p-3 rounded-lg border-r-4 border-amber-400 space-y-1">
           <p class="text-sm text-gray-700"><strong>السبب:</strong> ${warning.reason}</p>
           <p class="text-xs text-gray-500">التاريخ: ${new Date(warning.createdAt).toLocaleDateString("ar-EG")}</p>
         </div>
       </div>`,
      "نعم، احذف",
      "إلغاء"
    );

    if (result.isConfirmed) {
      // تنفيذ الحذف مباشرة بدون نافذة تحميل منفصلة
      const success = await deleteWarningById(warningId);

      if (success) {
        await showSuccessMessage(
          "✅ تم الحذف!",
          "تم حذف التنبيه بنجاح",
          `${student.firstName} ${student.lastName}`
        );

        onSuccess?.();
      }
    }
  }, [deleteWarningById, onSuccess]);

  return {
    showGiveWarningModal,
    showDeleteWarningModal,
    showDeleteWarningByIdModal,
  };
};
