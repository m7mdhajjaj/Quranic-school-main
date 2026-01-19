import { useCallback } from "react";
import { showSuccessToast } from "@/utils/toastUtils";
import { showErrorMessage } from "@/utils/sweetalertUtils";
import { EXPORT_CONFIG, MESSAGES } from "../constants";
import type { TeacherAssistant } from "../types";

export interface UseTeacherAssistantExportReturn {
  handleExport: (assistants: TeacherAssistant[]) => Promise<void>;
  isExporting: boolean;
}

export const useTeacherAssistantExport = () => {
  const handleExport = useCallback(async (assistants: TeacherAssistant[]) => {
    try {
      const { utils, writeFile } = await import("xlsx");
      
      const exportData = assistants.map((assistant: TeacherAssistant, index: number) => ({
        "م": index + 1,
        "رقم المساعد": assistant.assistantId || "-",
        "الاسم الكامل": [
          assistant.firstName,
          assistant.fatherName,
          assistant.grandFatherName,
          assistant.lastName
        ].filter(Boolean).join(" "),
        "الجنس": assistant.gender === 'male' || assistant.gender === 'ذكر' ? 'ذكر' : 'أنثى',
        "العمر": assistant.age ? `${assistant.age} سنة` : "-",
        "تاريخ الميلاد": assistant.birthDate || "-",
        "رقم الهوية": assistant.idNumber || "-",
        "رقم الهاتف": assistant.phoneNumber || "-",
        "البريد الإلكتروني": assistant.email || "-",
        "مكان السكن": assistant.residence || "-",
        "اسم الأم": assistant.motherName || "-",
        "الحلقات المخصصة": assistant.allowedGroups?.map((g: { _id: string; name: string }) => g.name).join(" | ") || "-",
        "عدد الحلقات": assistant.allowedGroups?.length || 0,
        "حالة الاتصال": assistant.lastSeen && new Date(assistant.lastSeen).getTime() > Date.now() - 5 * 60 * 1000 
          ? "متصل" 
          : "غير متصل",
        "آخر ظهور": assistant.lastSeen 
          ? new Date(assistant.lastSeen).toLocaleString('ar-SA')
          : "-",
        "الحالة النشطة": assistant.isActive ? "نشط" : "غير نشط",
      }));

      // إنشاء الـ worksheet
      const ws = utils.json_to_sheet(exportData);
      
      // تحسين عرض الأعمدة
      const columnWidths = [
        { wch: 5 },  // م
        { wch: 12 }, // رقم المساعد
        { wch: 25 }, // الاسم الكامل
        { wch: 10 }, // الجنس
        { wch: 10 }, // العمر
        { wch: 15 }, // تاريخ الميلاد
        { wch: 15 }, // رقم الهوية
        { wch: 15 }, // رقم الهاتف
        { wch: 25 }, // البريد الإلكتروني
        { wch: 20 }, // مكان السكن
        { wch: 15 }, // اسم الأم
        { wch: 30 }, // الحلقات
        { wch: 12 }, // عدد الحلقات
        { wch: 15 }, // حالة الاتصال
        { wch: 20 }, // آخر ظهور
        { wch: 12 }, // الحالة النشطة
      ];
      ws['!cols'] = columnWidths;

      // إنشاء الـ workbook
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, EXPORT_CONFIG.SHEET_NAME);
      
      // تصدير الملف
      const fileName = `${EXPORT_CONFIG.FILE_NAME}_${new Date().toISOString().split('T')[0]}.${EXPORT_CONFIG.FILE_EXTENSION}`;
      writeFile(wb, fileName);
      
      showSuccessToast(MESSAGES.SUCCESS.EXPORT);
    } catch (error) {
      console.error("Export error:", error);
      showErrorMessage(
        MESSAGES.ERROR.EXPORT,
        error instanceof Error ? error.message : MESSAGES.ERROR.UNEXPECTED
      );
      throw error;
    }
  }, []);

  return {
    handleExport,
    isExporting: false, // يمكن إضافة state للـ loading
  };
};
