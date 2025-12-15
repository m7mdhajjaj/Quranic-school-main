// Admin API functions
import api from './api';
import type { AdminFormData, Admin } from '../Validation/AdminValdation';
import { AxiosError } from 'axios';

// API Response Types
export interface AdminApiResponse {
  success: boolean;
  message?: string;
  data?: Admin | Admin[];
}

// Admin Stats Interface
export interface AdminStats {
  totalAdmins: number;
  activeAdmins: number;
  maleAdmins: number;
  femaleAdmins: number;
}

/**
 * Get all admins
 */
export const getAllAdmins = async (): Promise<AdminApiResponse> => {
  try {
    console.log('📊 جلب قائمة الإداريين...');
    const response = await api.get<AdminApiResponse>('/admins');
    
    if (response.data.success) {
      console.log('✅ تم جلب قائمة الإداريين بنجاح:', (response.data.data as Admin[])?.length || 0);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب الإداريين:', error);
    const axiosError = error as AxiosError<AdminApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب الإداريين'
    };
  }
};

/**
 * Get admin by ID
 */
export const getAdminById = async (id: string): Promise<AdminApiResponse> => {
  try {
    console.log('👤 جلب بيانات الإداري:', id);
    const response = await api.get<AdminApiResponse>(`/admins/${id}`);
    
    if (response.data.success) {
      console.log('✅ تم جلب بيانات الإداري بنجاح');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب بيانات الإداري:', error);
    const axiosError = error as AxiosError<AdminApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'الإداري غير موجود'
    };
  }
};

/**
 * Create new admin
 */
export const createAdmin = async (adminData: AdminFormData): Promise<AdminApiResponse> => {
  try {
    console.log('➕ إنشاء إداري جديد...');
    
    // تنظيف البيانات قبل الإرسال
    const cleanData = {
      ...adminData,
      // إزالة الحقول الفارغة
      fatherName: adminData.fatherName?.trim() || undefined,
      grandFatherName: adminData.grandFatherName?.trim() || undefined,
      motherName: adminData.motherName?.trim() || undefined,
      idNumber: adminData.idNumber?.trim() || undefined,
      residence: adminData.residence?.trim() || undefined,
    };
    
    const response = await api.post<AdminApiResponse>('/admins', cleanData);
    
    if (response.data.success) {
      console.log('✅ تم إنشاء الإداري بنجاح:', (response.data.data as Admin)?._id);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في إنشاء الإداري:', error);
    const axiosError = error as AxiosError<AdminApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء إنشاء الإداري'
    };
  }
};

/**
 * Update admin
 */
export const updateAdmin = async (id: string, adminData: Partial<AdminFormData>): Promise<AdminApiResponse> => {
  try {
    console.log('📝 تحديث بيانات الإداري:', id);
    
    // تنظيف البيانات وإزالة الحقول الفارغة
    const cleanData = Object.entries(adminData).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);
    
    // إزالة كلمة المرور إذا كانت فارغة
    if (!cleanData.password) {
      delete cleanData.password;
    }
    
    const response = await api.put<AdminApiResponse>(`/admins/${id}`, cleanData);
    
    if (response.data.success) {
      console.log('✅ تم تحديث بيانات الإداري بنجاح');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في تحديث بيانات الإداري:', error);
    const axiosError = error as AxiosError<AdminApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء تحديث بيانات الإداري'
    };
  }
};

/**
 * Delete admin (soft delete)
 */
export const deleteAdmin = async (id: string): Promise<AdminApiResponse> => {
  try {
    console.log('🗑️ حذف الإداري:', id);
    const response = await api.delete<AdminApiResponse>(`/admins/${id}`);
    
    if (response.data.success) {
      console.log('✅ تم حذف الإداري بنجاح');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في حذف الإداري:', error);
    const axiosError = error as AxiosError<AdminApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء حذف الإداري'
    };
  }
};

/**
 * Get admin statistics
 */
export const getAdminStats = async (): Promise<{ success: boolean; data?: AdminStats; message?: string }> => {
  try {
    console.log('📈 جلب إحصائيات الإداريين...');
    const response = await api.get<{ success: boolean; data: AdminStats }>('/admins/stats');
    
    if (response.data.success) {
      console.log('✅ تم جلب إحصائيات الإداريين بنجاح');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات الإداريين:', error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب الإحصائيات'
    };
  }
};

/**
 * Upload admin avatar
 */
export const uploadAdminAvatar = async (id: string, file: File): Promise<AdminApiResponse> => {
  try {
    console.log('📸 رفع صورة الإداري:', id);
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post<AdminApiResponse>(
      `/admins/${id}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    if (response.data.success) {
      console.log('✅ تم رفع صورة الإداري بنجاح');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في رفع صورة الإداري:', error);
    const axiosError = error as AxiosError<AdminApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء رفع الصورة'
    };
  }
};

/**
 * Get admin avatar URL
 */
export const getAdminAvatar = (id: string): string => {
  return `${api.defaults.baseURL}/admins/${id}/avatar`;
};

/**
 * Change admin password
 */
export const changeAdminPassword = async (
  id: string, 
  currentPassword: string, 
  newPassword: string
): Promise<AdminApiResponse> => {
  try {
    console.log('🔑 تغيير كلمة مرور الإداري:', id);
    
    const response = await api.put<AdminApiResponse>(`/admins/${id}/password`, {
      currentPassword,
      newPassword,
    });
    
    if (response.data.success) {
      console.log('✅ تم تغيير كلمة المرور بنجاح');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في تغيير كلمة المرور:', error);
    const axiosError = error as AxiosError<AdminApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور'
    };
  }
};

/**
 * Toggle admin active status
 */
export const toggleAdminStatus = async (id: string, isActive: boolean): Promise<AdminApiResponse> => {
  try {
    console.log(`${isActive ? '✅' : '❌'} ${isActive ? 'تفعيل' : 'إلغاء تفعيل'} الإداري:`, id);
    
    const response = await api.put<AdminApiResponse>(`/admins/${id}/status`, {
      isActive,
    });
    
    if (response.data.success) {
      console.log(`✅ تم ${isActive ? 'تفعيل' : 'إلغاء تفعيل'} الإداري بنجاح`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في تغيير حالة الإداري:', error);
    const axiosError = error as AxiosError<AdminApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء تغيير حالة الإداري'
    };
  }
};

// Default export object with all functions
export default {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminStats,
  uploadAdminAvatar,
  getAdminAvatar,
  changeAdminPassword,
  toggleAdminStatus,
};