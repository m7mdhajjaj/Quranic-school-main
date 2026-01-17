import { useState, useCallback } from "react";
import { 
  deleteTeacherAssistant as deleteTeacherAssistantApi,
  createTeacherAssistant as createTeacherAssistantApi,
  updateTeacherAssistant as updateTeacherAssistantApi,
  bulkDeleteTeacherAssistants as bulkDeleteTeacherAssistantsApi
} from "@/Api/teacherAssistantApi";
import type { TeacherAssistant } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TeacherAssistantFormData = any;

export const useTeacherAssistantsActions = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTeacherAssistant = useCallback(async (data: TeacherAssistantFormData) => {
    setIsSubmitting(true);
    try {
      const response = await createTeacherAssistantApi(data);
      if (!response.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = response as any;
        const errorMsg = res.message || 
          (res.errors && Array.isArray(res.errors) ? res.errors.join('\n') : null) ||
          "فشل في إنشاء مساعد المدرس";
        throw new Error(errorMsg);
      }
      return response;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateTeacherAssistant = useCallback(async (id: string, data: Partial<TeacherAssistantFormData>) => {
    setIsSubmitting(true);
    try {
      const response = await updateTeacherAssistantApi(id, data);
      if (!response.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = response as any;
        const errorMsg = res.message || 
          (res.errors && Array.isArray(res.errors) ? res.errors.join('\n') : null) ||
          "فشل في تحديث مساعد المدرس";
        throw new Error(errorMsg);
      }
      return response;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deleteTeacherAssistant = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await deleteTeacherAssistantApi(id);
      if (!response.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = response as any;
        const errorMsg = res.message || "فشل في حذف مساعد المدرس";
        throw new Error(errorMsg);
      }
      return response;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const bulkDeleteTeacherAssistants = useCallback(async (ids: string[]) => {
    setIsSubmitting(true);
    try {
      const response = await bulkDeleteTeacherAssistantsApi(ids);
      if (!response.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = response as any;
        const errorMsg = res.message || "فشل في حذف مساعدي المدرسين";
        throw new Error(errorMsg);
      }
      return response;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Handle export
  const handleExport = useCallback((assistants: TeacherAssistant[]) => {
    const csvContent = [
      ["رقم المساعد", "الاسم الأول", "الاسم الأخير", "البريد الإلكتروني", "رقم الهاتف", "الجنس", "العمر", "الحلقات"].join(","),
      ...assistants.map((a) =>
        [
          a.assistantId,
          a.firstName,
          a.lastName,
          a.email,
          a.phoneNumber,
          a.gender,
          a.age || "",
          a.allowedGroups?.map(g => g.name).join(" - ") || "",
        ].join(",")
      ),
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "teacher_assistants.csv";
    link.click();
  }, []);

  return {
    createTeacherAssistant,
    updateTeacherAssistant,
    deleteTeacherAssistant,
    bulkDeleteTeacherAssistants,
    handleExport,
    isSubmitting,
  };
};
