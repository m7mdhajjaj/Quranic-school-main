// Secretary API functions
import api from './api';
import type { SecretaryFormData, Secretary, SecretaryPermissions } from '../Validation/secretaryValidation';
import { AxiosError } from 'axios';

// API Response Types
export interface SecretaryApiResponse {
  success: boolean;
  message?: string;
  data?: Secretary | Secretary[];
  count?: number;
}

// Secretary Stats Interface
export interface SecretaryStats {
  total: number;
  male: number;
  female: number;
  avgAge: number;
  malePercentage: number;
  femalePercentage: number;
}

export interface SecretaryStatsResponse {
  success: boolean;
  message?: string;
  data?: SecretaryStats;
}

// Re-export types
export type { Secretary, SecretaryFormData, SecretaryPermissions };

/**
 * Get all secretaries
 */
export const getAllSecretaries = async (): Promise<SecretaryApiResponse> => {
  try {
    console.log('📊 جلب قائمة السكرتيرين...');
    const response = await api.get<SecretaryApiResponse>('/secretaries');
    
    if (response.data.success) {
      console.log('✅ تم جلب قائمة السكرتيرين بنجاح:', (response.data.data as Secretary[])?.length || 0);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب السكرتيرين:', error);
    const axiosError = error as AxiosError<SecretaryApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب السكرتيرين'
    };
  }
};

/**
 * Get secretary by ID
 */
export const getSecretaryById = async (id: string): Promise<SecretaryApiResponse> => {
  try {
    console.log('🔍 جلب بيانات السكرتير:', id);
    const response = await api.get<SecretaryApiResponse>(`/secretaries/${id}`);
    
    if (response.data.success) {
      console.log('✅ تم جلب بيانات السكرتير بنجاح');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب بيانات السكرتير:', error);
    const axiosError = error as AxiosError<SecretaryApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'السكرتير غير موجود'
    };
  }
};

/**
 * Create new secretary
 */
export const createSecretary = async (secretaryData: SecretaryFormData): Promise<SecretaryApiResponse> => {
  try {
    console.log('➕ إنشاء سكرتير جديد...');
    
    // تنظيف البيانات قبل الإرسال
    const cleanData = {
      ...secretaryData,
      // إزالة الحقول الفارغة
      fatherName: secretaryData.fatherName?.trim() || undefined,
      grandFatherName: secretaryData.grandFatherName?.trim() || undefined,
      motherName: secretaryData.motherName?.trim() || undefined,
      residence: secretaryData.residence?.trim() || undefined,
    };
    
    const response = await api.post<SecretaryApiResponse>('/secretaries', cleanData);
    
    if (response.data.success) {
      console.log('✅ تم إنشاء السكرتير بنجاح:', (response.data.data as Secretary)?._id);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في إنشاء السكرتير:', error);
    const axiosError = error as AxiosError<SecretaryApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء إنشاء السكرتير'
    };
  }
};

/**
 * Update secretary
 */
export const updateSecretary = async (id: string, secretaryData: Partial<SecretaryFormData>): Promise<SecretaryApiResponse> => {
  try {
    console.log('📝 تحديث بيانات السكرتير:', id);
    
    // تنظيف البيانات وإزالة الحقول الفارغة
    const cleanData: Partial<SecretaryFormData> = {};
    
    Object.entries(secretaryData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        (cleanData as Record<string, unknown>)[key] = typeof value === 'string' ? value.trim() : value;
      }
    });
    
    const response = await api.put<SecretaryApiResponse>(`/secretaries/${id}`, cleanData);
    
    if (response.data.success) {
      console.log('✅ تم تحديث بيانات السكرتير بنجاح');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في تحديث بيانات السكرتير:', error);
    const axiosError = error as AxiosError<SecretaryApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء تحديث بيانات السكرتير'
    };
  }
};

/**
 * Delete secretary
 */
export const deleteSecretary = async (id: string): Promise<SecretaryApiResponse> => {
  try {
    console.log('🗑️ حذف السكرتير:', id);
    const response = await api.delete<SecretaryApiResponse>(`/secretaries/${id}`);
    
    if (response.data.success) {
      console.log('✅ تم حذف السكرتير بنجاح');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في حذف السكرتير:', error);
    const axiosError = error as AxiosError<SecretaryApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء حذف السكرتير'
    };
  }
};

/**
 * Update secretary permissions
 */
export const updateSecretaryPermissions = async (id: string, permissions: SecretaryPermissions): Promise<SecretaryApiResponse> => {
  try {
    console.log('🔐 تحديث صلاحيات السكرتير:', id);
    const response = await api.patch<SecretaryApiResponse>(`/secretaries/${id}/permissions`, { permissions });
    
    if (response.data.success) {
      console.log('✅ تم تحديث صلاحيات السكرتير بنجاح');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في تحديث صلاحيات السكرتير:', error);
    const axiosError = error as AxiosError<SecretaryApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء تحديث الصلاحيات'
    };
  }
};

/**
 * Change secretary password
 */
export const changeSecretaryPassword = async (id: string, currentPassword: string, newPassword: string): Promise<SecretaryApiResponse> => {
  try {
    console.log('🔑 تغيير كلمة مرور السكرتير:', id);
    const response = await api.patch<SecretaryApiResponse>(`/secretaries/${id}/password`, {
      currentPassword,
      newPassword
    });
    
    if (response.data.success) {
      console.log('✅ تم تغيير كلمة المرور بنجاح');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في تغيير كلمة المرور:', error);
    const axiosError = error as AxiosError<SecretaryApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور'
    };
  }
};

/**
 * Upload secretary avatar
 */
export const uploadSecretaryAvatar = async (id: string, file: File): Promise<SecretaryApiResponse & { avatarUrl?: string }> => {
  try {
    console.log('📷 رفع صورة السكرتير:', id);
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post<SecretaryApiResponse & { avatarUrl?: string }>(`/secretaries/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.data.success) {
      console.log('✅ تم رفع الصورة بنجاح');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في رفع الصورة:', error);
    const axiosError = error as AxiosError<SecretaryApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء رفع الصورة'
    };
  }
};

/**
 * Get secretary avatar
 */
export const getSecretaryAvatar = async (id: string): Promise<{ success: boolean; avatarUrl?: string | null; message?: string }> => {
  try {
    const response = await api.get<{ success: boolean; avatarUrl: string | null }>(`/secretaries/${id}/avatar`);
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب الصورة:', error);
    return {
      success: false,
      avatarUrl: null,
      message: 'حدث خطأ أثناء جلب الصورة'
    };
  }
};

/**
 * Delete secretary avatar
 */
export const deleteSecretaryAvatar = async (id: string): Promise<SecretaryApiResponse> => {
  try {
    console.log('🗑️ حذف صورة السكرتير:', id);
    const response = await api.delete<SecretaryApiResponse>(`/secretaries/${id}/avatar`);
    
    if (response.data.success) {
      console.log('✅ تم حذف الصورة بنجاح');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في حذف الصورة:', error);
    const axiosError = error as AxiosError<SecretaryApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء حذف الصورة'
    };
  }
};

/**
 * Get secretary statistics
 */
export const getSecretaryStats = async (): Promise<SecretaryStatsResponse> => {
  try {
    console.log('📊 جلب إحصائيات السكرتيرين...');
    const response = await api.get<SecretaryStatsResponse>('/secretaries/stats');
    
    if (response.data.success) {
      console.log('✅ تم جلب الإحصائيات بنجاح:', response.data.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب الإحصائيات:', error);
    const axiosError = error as AxiosError<SecretaryStatsResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب الإحصائيات'
    };
  }
};

// Default export object with all functions
export default {
  getAllSecretaries,
  getSecretaryById,
  createSecretary,
  updateSecretary,
  deleteSecretary,
  updateSecretaryPermissions,
  changeSecretaryPassword,
  uploadSecretaryAvatar,
  getSecretaryAvatar,
  deleteSecretaryAvatar,
  getSecretaryStats,
};
