// Student API functions
import api from './api';
import type { StudentFormData } from '../Validation/studentValidation';
import { AxiosError } from 'axios';

export interface Student {
  _id: string;
  studentId: number;
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  motherName: string;
  lastName: string;
  idNumber: string;
  password?: string;
  birthDate: Date | string;
  age?: number;
  gender: string;
  residence: string;
  teacher: string;
  group: string;
  email?: string;
  phoneNumber: string;
  avatar?: {
    url?: string;
    publicId?: string;
  };
  isActive: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  maleStudents: number;
  femaleStudents: number;
  byGroup: Array<{
    group: string;
    count: number;
  }>;
}

// Get all students
export const getAllStudents = async (): Promise<{ success: boolean; data?: Student[]; message?: string }> => {
  try {
    const response = await api.get('/students');
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب الطلاب'
    };
  }
};

// Get student by ID
export const getStudentById = async (id: string): Promise<{ success: boolean; data?: Student; message?: string }> => {
  try {
    const response = await api.get(`/students/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب الطالب'
    };
  }
};

// Create new student
export const createStudent = async (studentData: StudentFormData): Promise<{ success: boolean; data?: Student; message?: string }> => {
  try {
    console.log('📤 إرسال بيانات الطالب إلى الخادم:', JSON.stringify(studentData, null, 2));
    const response = await api.post('/students', studentData);
    console.log('✅ استجابة الخادم:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في إنشاء الطالب:', error);
    const axiosError = error as AxiosError<{message?: string; details?: unknown}>;
    
    // تسجيل تفاصيل أكثر عن الخطأ
    if (axiosError.response) {
      console.error('🔍 تفاصيل الخطأ من الخادم:');
      console.error('   - كود الحالة:', axiosError.response.status);
      console.error('   - الرسالة:', axiosError.response.data?.message);
      console.error('   - التفاصيل:', axiosError.response.data?.details);
      console.error('   - البيانات الكاملة:', axiosError.response.data);
    }
    
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء إنشاء الطالب'
    };
  }
};

// Update student
export const updateStudent = async (id: string, studentData: Partial<StudentFormData>): Promise<{ success: boolean; data?: Student; message?: string }> => {
  try {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error('Error updating student:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء تحديث الطالب'
    };
  }
};

// Delete student
export const deleteStudent = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting student:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء حذف الطالب'
    };
  }
};

// Get student statistics
export const getStudentStats = async (): Promise<{ success: boolean; data?: StudentStats; message?: string }> => {
  try {
    const response = await api.get('/students/stats/summary/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching student stats:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب إحصائيات الطلاب'
    };
  }
};

// Get students by group
export const getStudentsByGroup = async (groupName: string): Promise<{ success: boolean; data?: Student[]; message?: string }> => {
  try {
    const response = await api.get(`/students/group/${encodeURIComponent(groupName)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching students by group:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب طلاب الحلقة'
    };
  }
};

// Get students by teacher
export const getStudentsByTeacher = async (teacherName: string): Promise<{ success: boolean; data?: Student[]; message?: string }> => {
  try {
    const response = await api.get(`/students/teacher/${encodeURIComponent(teacherName)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching students by teacher:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب طلاب المعلم'
    };
  }
};

// Upload student avatar
export const uploadStudentAvatar = async (id: string, avatarFile: File): Promise<{ success: boolean; message?: string }> => {
  try {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response = await api.post(`/students/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading student avatar:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء رفع الصورة'
    };
  }
};

// Search students
export const searchStudents = async (query: string): Promise<{ success: boolean; data?: Student[]; message?: string }> => {
  try {
    const response = await api.get(`/students/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching students:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء البحث عن الطلاب'
    };
  }
};

// Toggle student active status
export const toggleStudentStatus = async (id: string): Promise<{ success: boolean; data?: Student; message?: string }> => {
  try {
    const response = await api.patch(`/students/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error('Error toggling student status:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء تغيير حالة الطالب'
    };
  }
};

// Bulk operations
export const bulkDeleteStudents = async (studentIds: string[]): Promise<{ success: boolean; deletedCount?: number; message?: string }> => {
  try {
    const response = await api.delete('/students/bulk', {
      data: { studentIds }
    });
    return response.data;
  } catch (error) {
    console.error('Error bulk deleting students:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء حذف الطلاب'
    };
  }
};

export const bulkUpdateStudents = async (updates: Array<{id: string; data: Partial<StudentFormData>}>): Promise<{ success: boolean; updatedCount?: number; message?: string }> => {
  try {
    const response = await api.patch('/students/bulk', { updates });
    return response.data;
  } catch (error) {
    console.error('Error bulk updating students:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء تحديث الطلاب'
    };
  }
};