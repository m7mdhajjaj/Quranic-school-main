import { useState } from "react";
import { bulkSaveAttendance } from "@/Api/attendanceApi";
import { showSuccessToast } from "@/utils/toastUtils";
import { showErrorMessage } from "@/utils/sweetalertUtils";
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
         showErrorMessage(
           "لا يمكن تعديل الحضور",
           `⚠️ التاريخ قديم جداً (مضى عليه ${daysAgo} يوم)\n\n` +
           `📋 القاعدة: يمكن تعديل الحضور خلال أسبوع واحد فقط\n\n` +
           `💡 لتسجيل حضور جديد، اختر تاريخاً حديثاً`
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
        showErrorMessage("خطأ في البيانات", "لا يوجد طلاب لتسجيل حضورهم");
        setIsSaving(false);
        return;
      }

      console.log("📤 Sending attendance data:", {
        date,
        recordsCount: records.length,
        sampleRecord: records[0],
        allStudentsCount: visibleStudents.length,
      });

      // إرسال البيانات للـ API (Upsert - تعديل أو إنشاء)
      const result = await bulkSaveAttendance({ date, records });

      // تنفيذ callback النجاح
      onSaveSuccess();

      // عرض رسالة النجاح مع تفاصيل الـ Upsert
      const statsInfo = result.stats 
        ? ` (جديد: ${result.stats.new}, معدّل: ${result.stats.updated})`
        : '';
      showSuccessToast(
        `✅ تم حفظ الحضور بنجاح${statsInfo} - حاضر: ${presentCount} | غائب: ${absentCount}`
      );
    } catch (e) {
      console.error("❌ خطأ في حفظ الحضور:", e);
      const error = e as { response?: { data?: { message?: string; details?: string; daysAgo?: number; isFutureDate?: boolean } } };
      
      // التعامل مع خطأ التاريخ المستقبلي من Backend
      if (error.response?.data?.isFutureDate) {
        showErrorMessage(
          "تاريخ غير صالح",
          `⚠️ ${error.response.data.message}\n\n` +
          `📋 ${error.response.data.details}\n\n` +
          `💡 اختر تاريخاً من اليوم أو الأيام الماضية`
        );
        return;
      }
      
      // التعامل مع خطأ التاريخ القديم من Backend
      if (error.response?.data?.daysAgo) {
        const days = error.response.data.daysAgo;
        showErrorMessage(
          "لا يمكن تعديل الحضور",
          `⚠️ التاريخ قديم جداً (مضى ${days} يوم)\n\n` +
          `📋 القاعدة: يمكن تعديل الحضور خلال أسبوع واحد فقط\n\n` +
          `💡 لتسجيل حضور جديد، اختر تاريخاً حديثاً`
        );
        return;
      }
      
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.details ||
        "تعذر حفظ السجل";
      showErrorMessage("خطأ في الحفظ", errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSave,
  };
};
