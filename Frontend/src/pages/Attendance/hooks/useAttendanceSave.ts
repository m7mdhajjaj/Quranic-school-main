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
      // التحقق من أن التاريخ ليس قديماً جداً (تحقق بسيط بدلاً من Yup)
      if (isDateTooOld) {
         showErrorToast(
           `⚠️ لا يمكن تعديل الحضور - التاريخ قديم (مضى ${daysAgo} يوم)\n\n` +
           `📋 القاعدة: يمكن تعديل الحضور خلال أسبوع واحد فقط من تاريخ أخذ الحضور.\n\n` +
           `💡 لتسجيل حضور جديد، اختر تاريخاً حديثاً (خلال الأسبوع الماضي).`
         );
         return;
       }

      setIsSaving(true);
      
      // تجهيز البيانات
      // تحويل الطلاب إلى تنسيق السجلات المطلوب
      const records = visibleStudents
        .filter((s) => s._id)
        .map((s) => ({
          studentId: s._id,
          isPresent: s.isPresent,
        }));

      if (records.length === 0) {
        showErrorToast("لا يوجد طلاب لتسجيل حضورهم");
        setIsSaving(false);
        return;
      }

      console.log("📤 Sending attendance data:", {
        date,
        recordsCount: records.length,
        sampleRecord: records[0],
        allStudentsCount: visibleStudents.length,
      });

      // إرسال البيانات للـ API
      await bulkSaveAttendance({ date, records });

      // تنفيذ callback النجاح
      onSaveSuccess();

      // عرض رسالة النجاح
      showSuccessToast(
        `✓ تم رصد الحضور بنجاح - حاضر: ${presentCount} | غائب: ${absentCount} | نسبة الحضور: ${attendanceRate}%`
      );
    } catch (e) {
      console.error("❌ خطأ في حفظ الحضور:", e);
      const error = e as { response?: { data?: { message?: string; details?: string; daysAgo?: number } } };
      
      // التعامل مع خطأ التاريخ القديم من Backend
      if (error.response?.data?.daysAgo) {
        const days = error.response.data.daysAgo;
        showErrorToast(
          `⚠️ لا يمكن تعديل الحضور - التاريخ قديم (مضى ${days} يوم)\n\n` +
          `📋 القاعدة: يمكن تعديل الحضور خلال أسبوع واحد فقط من تاريخ أخذ الحضور.\n\n` +
          `💡 لتسجيل حضور جديد، اختر تاريخاً حديثاً (خلال الأسبوع الماضي).`
        );
        return;
      }
      
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
