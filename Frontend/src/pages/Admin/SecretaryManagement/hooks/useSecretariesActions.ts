import { useState, useCallback } from "react";
import { 
  deleteSecretary as deleteSecretaryApi,
  createSecretary as createSecretaryApi,
  updateSecretary as updateSecretaryApi,
  bulkDeleteSecretaries as bulkDeleteSecretariesApi
} from "@/Api/secretaryApi";
import type { Secretary } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SecretaryFormData = any;

export const useSecretariesActions = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSecretary = useCallback(async (data: SecretaryFormData) => {
    setIsSubmitting(true);
    try {
      const response = await createSecretaryApi(data);
      if (!response.success) {
        // استخراج رسالة الخطأ المفصلة من الباك إند
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = response as any;
        const errorMsg = res.message || 
          (res.errors && Array.isArray(res.errors) ? res.errors.join('\n') : null) ||
          "فشل في إنشاء السكرتير";
        throw new Error(errorMsg);
      }
      return response;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateSecretary = useCallback(async (id: string, data: Partial<SecretaryFormData>) => {
    setIsSubmitting(true);
    try {
      const response = await updateSecretaryApi(id, data);
      if (!response.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = response as any;
        const errorMsg = res.message || 
          (res.errors && Array.isArray(res.errors) ? res.errors.join('\n') : null) ||
          "فشل في تحديث السكرتير";
        throw new Error(errorMsg);
      }
      return response;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deleteSecretary = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await deleteSecretaryApi(id);
      if (!response.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = response as any;
        const errorMsg = res.message || "فشل في حذف السكرتير";
        throw new Error(errorMsg);
      }
      return response;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const bulkDeleteSecretaries = useCallback(async (ids: string[]) => {
    setIsSubmitting(true);
    try {
      const response = await bulkDeleteSecretariesApi(ids);
      if (!response.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = response as any;
        const errorMsg = res.message || "فشل في حذف السكرتيرين";
        throw new Error(errorMsg);
      }
      return response;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Handle export
  const handleExport = useCallback((secretaries: Secretary[]) => {
    const csvContent = [
      ["رقم السكرتير", "الاسم الأول", "الاسم الأخير", "البريد الإلكتروني", "رقم الهاتف", "الجنس", "العمر"].join(","),
      ...secretaries.map((s) =>
        [
          s.secretaryId,
          s.firstName,
          s.lastName,
          s.email,
          s.phoneNumber,
          s.gender,
          s.age || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `secretaries_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }, []);

  return {
    createSecretary,
    updateSecretary,
    deleteSecretary,
    bulkDeleteSecretaries,
    handleExport,
    isSubmitting,
  };
};
