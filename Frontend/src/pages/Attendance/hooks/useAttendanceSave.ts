import { useState } from "react";
import { bulkSaveAttendance } from "@/Api/attendanceApi";
import {
  showSuccessToast,
  showErrorToast,
} from "@/utils/toastUtils";
import type { AttendanceStudent } from "../types/absence.types";

interface UseAttendanceSaveProps {
  visibleStudents: AttendanceStudent[];
  date: string;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
  onSaveSuccess: () => void;
  isDateTooOld: boolean;
  daysAgo: number;
}

/**
 * Hook لإدارة عملية حفظ الحضور
 */
export const useAttendanceSave = ({
  visibleStudents,
  date,
  presentCount,
  absentCount,
  attendanceRate,
  onSaveSuccess,
  isDateTooOld,
  daysAgo,
}: UseAttendanceSaveProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      // التحقق من أن التاريخ ليس قديماً جداً
      if (isDateTooOld) {
        showErrorToast(
          `⚠️ لا يمكن التعديل - التاريخ قديم (مضى عليه ${daysAgo} يوم). لا يمكن تعديل الحضور بعد مرور أسبوع.`
        );
        return;
      }

      setIsSaving(true);

      // تجهيز البيانات للإرسال
      const payload = visibleStudents
        .filter((s) => s._id)
        .map((s) => ({
          studentId: s._id,
          date,
          isPresent: s.isPresent,
        }));

      // إرسال البيانات للـ API
      await bulkSaveAttendance({ date, records: payload });

      // تنفيذ callback النجاح
      onSaveSuccess();

      // عرض رسالة النجاح
      showSuccessToast(
        `✓ تم رصد الحضور بنجاح - حاضر: ${presentCount} | غائب: ${absentCount} | نسبة الحضور: ${attendanceRate}%`
      );
    } catch (e) {
      console.error("❌ خطأ في حفظ الحضور:", e);
      const error = e as { response?: { data?: { message?: string; details?: string } } };
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.details ||
        "تعذر حفظ السجل";
      showErrorToast(`✗ خطأ في الحفظ - ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSave,
  };
};
