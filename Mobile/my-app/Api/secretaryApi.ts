// ============================================================================
// Secretary API - واجهة برمجة التطبيقات للسكرتير
// ============================================================================

import api from "./api";
import { AxiosError } from "axios";
import type {
  Secretary,
  SecretaryFormData,
  SecretaryPermissions,
  SecretaryStats,
  SecretaryFilters,
} from "@/types/secretary.types";

// Re-export types
export type {
  Secretary,
  SecretaryFormData,
  SecretaryPermissions,
  SecretaryStats,
  SecretaryFilters,
} from "@/types/secretary.types";

// API Response Types
export interface SecretaryApiResponse {
  success: boolean;
  message?: string;
  data?: Secretary | Secretary[];
  count?: number;
}

export interface SecretaryStatsResponse {
  success: boolean;
  message?: string;
  data?: SecretaryStats;
}

export interface DuplicateCheckResponse {
  success: boolean;
  isDuplicate?: boolean;
  message?: string;
  field?: string;
  existingUserType?: string;
  existingUserName?: string;
}

/**
 * Get all secretaries with filters
 * جلب جميع السكرتيرين مع الفلاتر
 */
export const getAllSecretaries = async (
  filters?: SecretaryFilters
): Promise<SecretaryApiResponse> => {
  try {
    console.log("📊 جلب قائمة السكرتيرين...", filters);

    const params: Record<string, string | number> = {};

    if (filters?.search?.trim()) {
      params.search = filters.search.trim();
    }
    if (filters?.gender && filters.gender !== "all") {
      params.gender = filters.gender;
    }
    if (filters?.minAge !== undefined && filters.minAge > 0) {
      params.minAge = filters.minAge;
    }
    if (filters?.maxAge !== undefined && filters.maxAge < 100) {
      params.maxAge = filters.maxAge;
    }
    if (filters?.sortBy) {
      params.sortBy = filters.sortBy;
    }
    if (filters?.sortOrder) {
      params.sortOrder = filters.sortOrder;
    }

    const response = await api.get<SecretaryApiResponse>("/secretaries", {
      params,
    });

    if (response.data.success) {
      console.log(
        "✅ تم جلب قائمة السكرتيرين بنجاح:",
        (response.data.data as Secretary[])?.length || 0
      );
    }

    return response.data;
  } catch (error) {
    console.error("❌ خطأ في جلب السكرتيرين:", error);
    const axiosError = error as AxiosError<SecretaryApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "حدث خطأ أثناء جلب السكرتيرين",
    };
  }
};

/**
 * Get secretary by ID
 * جلب سكرتير بالمعرف
 */
export const getSecretaryById = async (
  id: string
): Promise<SecretaryApiResponse> => {
  try {
    console.log("🔍 جلب بيانات السكرتير:", id);
    const response = await api.get<SecretaryApiResponse>(`/secretaries/${id}`);

    if (response.data.success) {
      console.log("✅ تم جلب بيانات السكرتير بنجاح");
    }

    return response.data;
  } catch (error) {
    console.error("❌ خطأ في جلب بيانات السكرتير:", error);
    const axiosError = error as AxiosError<SecretaryApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "السكرتير غير موجود",
    };
  }
};

/**
 * Create new secretary
 * إنشاء سكرتير جديد
 */
export const createSecretary = async (
  secretaryData: SecretaryFormData
): Promise<SecretaryApiResponse> => {
  try {
    console.log("➕ إنشاء سكرتير جديد...");

    // تنظيف البيانات قبل الإرسال
    const cleanData = {
      ...secretaryData,
      fatherName: secretaryData.fatherName?.trim() || undefined,
      grandFatherName: secretaryData.grandFatherName?.trim() || undefined,
      motherName: secretaryData.motherName?.trim() || undefined,
      residence: secretaryData.residence?.trim() || undefined,
    };

    const response = await api.post<SecretaryApiResponse>(
      "/secretaries",
      cleanData
    );

    if (response.data.success) {
      console.log(
        "✅ تم إنشاء السكرتير بنجاح:",
        (response.data.data as Secretary)?._id
      );
    }

    return response.data;
  } catch (error) {
    console.error("❌ خطأ في إنشاء السكرتير:", error);
    const axiosError = error as AxiosError<SecretaryApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "حدث خطأ أثناء إنشاء السكرتير",
    };
  }
};

/**
 * Update secretary
 * تحديث بيانات السكرتير
 */
export const updateSecretary = async (
  id: string,
  secretaryData: Partial<SecretaryFormData>
): Promise<SecretaryApiResponse> => {
  try {
    console.log("📝 تحديث بيانات السكرتير:", id);

    // تنظيف البيانات وإزالة الحقول الفارغة
    const cleanData: Partial<SecretaryFormData> = {};

    Object.entries(secretaryData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        (cleanData as Record<string, unknown>)[key] =
          typeof value === "string" ? value.trim() : value;
      }
    });

    const response = await api.put<SecretaryApiResponse>(
      `/secretaries/${id}`,
      cleanData
    );

    if (response.data.success) {
      console.log("✅ تم تحديث بيانات السكرتير بنجاح");
    }

    return response.data;
  } catch (error) {
    console.error("❌ خطأ في تحديث بيانات السكرتير:", error);
    const axiosError = error as AxiosError<SecretaryApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        "حدث خطأ أثناء تحديث بيانات السكرتير",
    };
  }
};

/**
 * Delete secretary
 * حذف السكرتير
 */
export const deleteSecretary = async (
  id: string
): Promise<SecretaryApiResponse> => {
  try {
    console.log("🗑️ حذف السكرتير:", id);
    const response = await api.delete<SecretaryApiResponse>(
      `/secretaries/${id}`
    );

    if (response.data.success) {
      console.log("✅ تم حذف السكرتير بنجاح");
    }

    return response.data;
  } catch (error) {
    console.error("❌ خطأ في حذف السكرتير:", error);
    const axiosError = error as AxiosError<SecretaryApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "حدث خطأ أثناء حذف السكرتير",
    };
  }
};

/**
 * Update secretary permissions
 * تحديث صلاحيات السكرتير
 */
export const updateSecretaryPermissions = async (
  id: string,
  permissions: SecretaryPermissions
): Promise<SecretaryApiResponse> => {
  try {
    console.log("🔐 تحديث صلاحيات السكرتير:", id);
    const response = await api.patch<SecretaryApiResponse>(
      `/secretaries/${id}/permissions`,
      { permissions }
    );

    if (response.data.success) {
      console.log("✅ تم تحديث صلاحيات السكرتير بنجاح");
    }

    return response.data;
  } catch (error) {
    console.error("❌ خطأ في تحديث صلاحيات السكرتير:", error);
    const axiosError = error as AxiosError<SecretaryApiResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "حدث خطأ أثناء تحديث الصلاحيات",
    };
  }
};

/**
 * Get secretary statistics
 * جلب إحصائيات السكرتيرين
 */
export const getSecretaryStats = async (): Promise<SecretaryStatsResponse> => {
  try {
    console.log("📊 جلب إحصائيات السكرتيرين...");
    const response =
      await api.get<SecretaryStatsResponse>("/secretaries/stats");

    if (response.data.success) {
      console.log("✅ تم جلب الإحصائيات بنجاح:", response.data.data);
    }

    return response.data;
  } catch (error) {
    console.error("❌ خطأ في جلب الإحصائيات:", error);
    const axiosError = error as AxiosError<SecretaryStatsResponse>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "حدث خطأ أثناء جلب الإحصائيات",
    };
  }
};

/**
 * Check if field value is duplicate
 * فحص تكرار القيمة
 */
export const checkDuplicate = async (
  field: "email" | "phoneNumber" | "idNumber",
  value: string,
  excludeId?: string
): Promise<DuplicateCheckResponse> => {
  try {
    const response = await api.post<DuplicateCheckResponse>(
      "/secretaries/check-duplicate",
      {
        field,
        value,
        excludeId,
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<DuplicateCheckResponse>;
    if (axiosError.response?.data) {
      return axiosError.response.data;
    }
    return { success: false, message: "حدث خطأ في التحقق" };
  }
};

// Default export
export default {
  getAllSecretaries,
  getSecretaryById,
  createSecretary,
  updateSecretary,
  deleteSecretary,
  updateSecretaryPermissions,
  getSecretaryStats,
  checkDuplicate,
};
