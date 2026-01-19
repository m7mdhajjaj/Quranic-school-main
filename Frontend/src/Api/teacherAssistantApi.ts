// Teacher Assistant API functions
import api from './api';
import { AxiosError } from 'axios';

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
  password?: string;
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
  assignedTeacher?: {
    _id: string;
    firstName: string;
    lastName: string;
    teacherId: number;
  } | null;
  allowedGroups?: Array<{
    _id: string;
    name: string;
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
  assignedTeacher?: string;
  allowedGroups?: string[];
}

export interface TeacherAssistantApiResponse {
  success: boolean;
  message?: string;
  data?: TeacherAssistant | TeacherAssistant[];
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

export interface TeacherAssistantStatsResponse {
  success: boolean;
  message?: string;
  data?: TeacherAssistantStats;
}

export interface TeacherAssistantFiltersParams {
  search?: string;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  hasGroups?: string; // 'all' | 'with-groups' | 'without-groups'
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// =================== API Functions ===================

/**
 * Get all teacher assistants with search, filters and sorting support
 */
export const getAllTeacherAssistants = async (filters?: TeacherAssistantFiltersParams): Promise<TeacherAssistantApiResponse> => {
  try {
    console.log('📊 جلب قائمة مساعدي المدرسين...', filters);
    
    const params: Record<string, string | number> = {};
    
    if (filters?.search?.trim()) {
      params.search = filters.search.trim();
    }
    if (filters?.gender && filters.gender !== 'all') {
      params.gender = filters.gender;
    }
    if (filters?.minAge !== undefined && filters.minAge > 0) {
      params.minAge = filters.minAge;
    }
    if (filters?.maxAge !== undefined && filters.maxAge < 100) {
      params.maxAge = filters.maxAge;
    }
    if (filters?.hasGroups && filters.hasGroups !== 'all') {
      params.hasGroups = filters.hasGroups;
    }
    if (filters?.sortBy) {
      params.sortBy = filters.sortBy;
    }
    if (filters?.sortOrder) {
      params.sortOrder = filters.sortOrder;
    }
    
    const response = await api.get<TeacherAssistantApiResponse>('/teacher-assistants', { params });
    
    if (response.data.success) {
      console.log('✅ تم جلب قائمة مساعدي المدرسين بنجاح:', (response.data.data as TeacherAssistant[])?.length || 0);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب مساعدي المدرسين:', error);
    const axiosError = error as AxiosError<TeacherAssistantApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب مساعدي المدرسين'
    };
  }
};

/**
 * Get teacher assistant by ID
 */
export const getTeacherAssistantById = async (id: string): Promise<TeacherAssistantApiResponse> => {
  try {
    console.log('🔍 جلب بيانات مساعد المدرس:', id);
    const response = await api.get<TeacherAssistantApiResponse>(`/teacher-assistants/${id}`);
    
    if (response.data.success) {
      console.log('✅ تم جلب بيانات مساعد المدرس بنجاح');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب بيانات مساعد المدرس:', error);
    const axiosError = error as AxiosError<TeacherAssistantApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'مساعد المدرس غير موجود'
    };
  }
};

/**
 * Create new teacher assistant
 */
export const createTeacherAssistant = async (data: TeacherAssistantFormData): Promise<TeacherAssistantApiResponse> => {
  try {
    console.log('➕ إنشاء مساعد مدرس جديد...');
    
    const cleanData = {
      ...data,
      fatherName: data.fatherName?.trim() || undefined,
      grandFatherName: data.grandFatherName?.trim() || undefined,
      motherName: data.motherName?.trim() || undefined,
      residence: data.residence?.trim() || undefined,
    };
    
    const response = await api.post<TeacherAssistantApiResponse>('/teacher-assistants', cleanData);
    
    if (response.data.success) {
      console.log('✅ تم إنشاء مساعد المدرس بنجاح:', (response.data.data as TeacherAssistant)?._id);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في إنشاء مساعد المدرس:', error);
    const axiosError = error as AxiosError<TeacherAssistantApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء إنشاء مساعد المدرس'
    };
  }
};

/**
 * Update teacher assistant
 */
export const updateTeacherAssistant = async (id: string, data: Partial<TeacherAssistantFormData>): Promise<TeacherAssistantApiResponse> => {
  try {
    console.log('📝 تحديث بيانات مساعد المدرس:', id);
    
    const cleanData: Partial<TeacherAssistantFormData> = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        (cleanData as Record<string, unknown>)[key] = typeof value === 'string' ? value.trim() : value;
      }
    });
    
    const response = await api.put<TeacherAssistantApiResponse>(`/teacher-assistants/${id}`, cleanData);
    
    if (response.data.success) {
      console.log('✅ تم تحديث بيانات مساعد المدرس بنجاح');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في تحديث بيانات مساعد المدرس:', error);
    const axiosError = error as AxiosError<TeacherAssistantApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء تحديث بيانات مساعد المدرس'
    };
  }
};

/**
 * Delete teacher assistant
 */
export const deleteTeacherAssistant = async (id: string): Promise<TeacherAssistantApiResponse> => {
  try {
    console.log('🗑️ حذف مساعد المدرس:', id);
    const response = await api.delete<TeacherAssistantApiResponse>(`/teacher-assistants/${id}`);
    
    if (response.data.success) {
      console.log('✅ تم حذف مساعد المدرس بنجاح');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في حذف مساعد المدرس:', error);
    const axiosError = error as AxiosError<TeacherAssistantApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء حذف مساعد المدرس'
    };
  }
};

/**
 * Bulk delete teacher assistants
 */
export const bulkDeleteTeacherAssistants = async (ids: string[]): Promise<TeacherAssistantApiResponse> => {
  try {
    console.log('🗑️ حذف مجموعة من مساعدي المدرسين:', ids.length);
    const response = await api.post<TeacherAssistantApiResponse>('/teacher-assistants/bulk-delete', { ids });
    
    if (response.data.success) {
      console.log('✅ تم حذف مساعدي المدرسين بنجاح');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في حذف مساعدي المدرسين:', error);
    const axiosError = error as AxiosError<TeacherAssistantApiResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء حذف مساعدي المدرسين'
    };
  }
};

/**
 * Get teacher assistant stats
 */
export const getTeacherAssistantStats = async (): Promise<TeacherAssistantStatsResponse> => {
  try {
    console.log('📊 جلب إحصائيات مساعدي المدرسين...');
    const response = await api.get<TeacherAssistantStatsResponse>('/teacher-assistants/stats');
    
    if (response.data.success) {
      console.log('✅ تم جلب الإحصائيات بنجاح');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب الإحصائيات:', error);
    const axiosError = error as AxiosError<TeacherAssistantStatsResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب الإحصائيات'
    };
  }
};

/**
 * Get next available assistant ID
 */
export const getNextAssistantId = async (): Promise<{ success: boolean; nextId?: number; message?: string }> => {
  try {
    console.log('🔢 جلب الرقم التالي لمساعد المدرس...');
    const response = await api.get<{ success: boolean; data: { nextId: number } }>('/teacher-assistants/next-id');
    
    if (response.data.success) {
      return { success: true, nextId: response.data.data.nextId };
    }
    return { success: false, message: 'فشل في جلب الرقم التالي' };
  } catch (error) {
    console.error('❌ خطأ في جلب الرقم التالي:', error);
    return { success: false, message: 'حدث خطأ أثناء جلب الرقم التالي' };
  }
};

/**
 * Check for duplicate values across all users
 */
export const checkDuplicate = async (
  field: 'email' | 'phoneNumber' | 'idNumber' | 'assistantId',
  value: string,
  excludeId?: string
): Promise<{ 
  success: boolean; 
  isDuplicate?: boolean; 
  message?: string;
  existingUserType?: string;
  existingUserName?: string;
}> => {
  try {
    const params: Record<string, string> = { field, value };
    if (excludeId) {
      params.excludeId = excludeId;
    }
    
    const response = await api.get<{ 
      success: boolean; 
      data: { 
        isDuplicate: boolean;
        message?: string;
        existingUserType?: string;
        existingUserName?: string;
      } 
    }>('/teacher-assistants/check-duplicate', { params });
    
    if (response.data.success) {
      return { 
        success: true, 
        isDuplicate: response.data.data.isDuplicate,
        message: response.data.data.message,
        existingUserType: response.data.data.existingUserType,
        existingUserName: response.data.data.existingUserName,
      };
    }
    return { success: false };
  } catch (error) {
    console.error('❌ خطأ في التحقق من التكرار:', error);
    return { success: false };
  }
};
