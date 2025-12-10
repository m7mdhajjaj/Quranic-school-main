// Teacher API functions
import api from './api';
import type { TeacherFormData } from '../Validation/teacherValidation';
import { AxiosError } from 'axios';

export interface Teacher {
  _id: string;
  teacherId: number;
  firstName: string;
  lastName: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  idNumber?: string;
  email: string;
  phoneNumber: string;
  birthDate?: string; // YYYY-MM-DD format
  age?: number;
  gender?: string;
  residence?: string;
  groups?: {
    id: string;
    name: string;
    number: number;
  }[]; // الحلقات التي يدرسها المعلم
  avatar?: {
    data: Buffer;
    contentType: string;
  };
  role: string;
  isActive: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherStats {
  total: number;
  active: number;
  inactive: number;
  male: number;
  female: number;
  withGroups: number;
  withoutGroups: number;
  avgAge: string | number;
}

// Get all teachers with filters
export const getAllTeachers = async (filters?: any): Promise<{ success: boolean; data?: Teacher[]; stats?: any; message?: string }> => {
  try {
    const response = await api.get('/teachers', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب المعلمين'
    };
  }
};

// Create new teacher
export const createTeacher = async (teacherData: TeacherFormData): Promise<{ success: boolean; data?: Teacher; message?: string }> => {
  try {
    const response = await api.post('/teachers', teacherData);
    return response.data;
  } catch (error) {
    console.error('Error creating teacher:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء إنشاء المعلم'
    };
  }
};

// Update teacher
export const updateTeacher = async (id: string, teacherData: Partial<TeacherFormData>): Promise<{ success: boolean; data?: Teacher; message?: string }> => {
  try {
    const response = await api.put(`/teachers/${id}`, teacherData);
    return response.data;
  } catch (error) {
    console.error('Error updating teacher:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء تحديث المعلم'
    };
  }
};

// Delete teacher
export const deleteTeacher = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting teacher:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء حذف المعلم'
    };
  }
};

// Get teacher statistics
export const getTeacherStats = async (): Promise<{ success: boolean; data?: TeacherStats; message?: string }> => {
  try {
    const response = await api.get('/teachers/stats/summary/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher stats:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب إحصائيات المعلمين'
    };
  }
};

// Export teachers to CSV
export const exportTeachersToCSV = async (filters?: {
  gender?: string;
  minAge?: number;
  maxAge?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  try {
    console.log("📥 تصدير المعلمين إلى CSV...");
    
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'all') {
          params.append(key, String(value));
        }
      });
    }

    const url = `/teachers/export${params.toString() ? `?${params}` : ''}`;
    
    // Download file directly
    const response = await api.get(url, {
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `teachers_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    console.log("✅ تم تصدير البيانات بنجاح");
    return { success: true };
  } catch (error) {
    console.error("❌ خطأ في تصدير البيانات:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message || "حدث خطأ أثناء تصدير البيانات"
    );
  }
};

// Check for duplicate field
export const checkDuplicateTeacher = async (params: {
  field: 'email' | 'phoneNumber' | 'idNumber';
  value: string;
  excludeId?: string;
}): Promise<{ success: boolean; isDuplicate: boolean; message?: string; field?: string; existingUserType?: string }> => {
  try {
    const response = await api.get('/teachers/check-duplicate', { params });
    return response.data;
  } catch (error) {
    console.error('Error checking duplicate:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      isDuplicate: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء التحقق من التكرار'
    };
  }
};

// Bulk delete teachers
export const bulkDeleteTeachers = async (teacherIds: string[]): Promise<{ success: boolean; message?: string; deletedCount?: number }> => {
  try {
    const response = await api.delete('/teachers/bulk', {
      data: { teacherIds }
    });
    return response.data;
  } catch (error) {
    console.error('Error bulk deleting teachers:', error);
    const axiosError = error as AxiosError<{message?: string; details?: any}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء حذف المعلمين'
    };
  }
};