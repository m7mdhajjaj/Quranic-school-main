// Teacher Assistant API functions for Mobile
import api from './api';

// =================== Types ===================

export interface TeacherAssistant {
  _id: string;
  assistantId: number;
  // الأسماء
  firstName: string;
  lastName: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  // الهوية والتواصل
  idNumber: string;
  email: string;
  phoneNumber: string;
  // البيانات الشخصية
  birthDate: string;
  age?: number;
  gender: "male" | "female" | "ذكر" | "أنثى";
  residence: string;
  // الصورة الشخصية
  avatar?: {
    url?: string;
    publicId?: string;
  };
  // العلاقات
  allowedGroups?: Array<{
    _id: string;
    name: string;
    number?: number;
  }>;
  // الحالة
  lastSeen?: Date;
  fullName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TeacherAssistantFormData {
  assistantId?: number;
  firstName: string;
  lastName: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  idNumber: string;
  email: string;
  phoneNumber: string;
  password?: string;
  birthDate: string;
  gender: "ذكر" | "أنثى";
  residence: string;
  allowedGroups?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

export interface TeacherAssistantStats {
  total: number;
  male: number;
  female: number;
  avgAge: number;
  malePercentage: number;
  femalePercentage: number;
}

// =================== API Functions ===================

/**
 * Get all teacher assistants
 */
export const getAllTeacherAssistants = async (
  params?: {
    search?: string;
    gender?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<ApiResponse<TeacherAssistant[]>> => {
  try {
    const response = await api.get('/teacher-assistants', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching teacher assistants:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'فشل في جلب المساعدين',
      data: [],
    };
  }
};

/**
 * Get teacher assistant by ID
 */
export const getTeacherAssistantById = async (
  id: string
): Promise<ApiResponse<TeacherAssistant>> => {
  try {
    const response = await api.get(`/teacher-assistants/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching teacher assistant:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'فشل في جلب بيانات المساعد',
    };
  }
};

/**
 * Create new teacher assistant
 */
export const createTeacherAssistant = async (
  data: TeacherAssistantFormData
): Promise<ApiResponse<TeacherAssistant>> => {
  try {
    const response = await api.post('/teacher-assistants', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating teacher assistant:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'فشل في إضافة المساعد',
    };
  }
};

/**
 * Update teacher assistant
 */
export const updateTeacherAssistant = async (
  id: string,
  data: Partial<TeacherAssistantFormData>
): Promise<ApiResponse<TeacherAssistant>> => {
  try {
    const response = await api.put(`/teacher-assistants/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating teacher assistant:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'فشل في تحديث بيانات المساعد',
    };
  }
};

/**
 * Delete teacher assistant
 */
export const deleteTeacherAssistant = async (
  id: string
): Promise<ApiResponse> => {
  try {
    const response = await api.delete(`/teacher-assistants/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting teacher assistant:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'فشل في حذف المساعد',
    };
  }
};

/**
 * Bulk delete teacher assistants
 */
export const bulkDeleteTeacherAssistants = async (
  ids: string[]
): Promise<ApiResponse> => {
  try {
    const response = await api.post('/teacher-assistants/bulk-delete', { ids });
    return response.data;
  } catch (error: any) {
    console.error('Error bulk deleting teacher assistants:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'فشل في حذف المساعدين',
    };
  }
};

/**
 * Get teacher assistant statistics
 */
export const getTeacherAssistantStats = async (): Promise<
  ApiResponse<TeacherAssistantStats>
> => {
  try {
    const response = await api.get('/teacher-assistants/stats');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching teacher assistant stats:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'فشل في جلب إحصائيات المساعدين',
      data: {
        total: 0,
        male: 0,
        female: 0,
        avgAge: 0,
        malePercentage: 0,
        femalePercentage: 0,
      },
    };
  }
};

/**
 * Check duplicate field
 */
export const checkDuplicate = async (
  field: 'email' | 'phoneNumber' | 'idNumber',
  value: string,
  excludeId?: string
): Promise<ApiResponse<{ isDuplicate: boolean }>> => {
  try {
    const response = await api.get('/teacher-assistants/check-duplicate', {
      params: { field, value, excludeId },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error checking duplicate:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'فشل في التحقق من التكرار',
    };
  }
};

/**
 * Get next assistant ID
 */
export const getNextAssistantId = async (): Promise<
  ApiResponse<{ nextId: number }>
> => {
  try {
    const response = await api.get('/teacher-assistants/next-id');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching next assistant ID:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'فشل في جلب رقم المساعد التالي',
    };
  }
};
