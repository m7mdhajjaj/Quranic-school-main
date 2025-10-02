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
  birthDate?: string;
  age?: number;
  gender?: string;
  residence?: string;
  address?: string; // مكان السكن
  specialCircle?: string; // الحلقة الخاصة
  groups?: string[];
  groupName?: string;
  role: string;
  isActive: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherStats {
  totalTeachers: number;
  activeTeachers: number;
  maleTeachers: number;
  femaleTeachers: number;
}

// Get all teachers
export const getAllTeachers = async (): Promise<{ success: boolean; data?: Teacher[]; message?: string }> => {
  try {
    const response = await api.get('/teachers');
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

// Get teacher by ID
export const getTeacherById = async (id: string): Promise<{ success: boolean; data?: Teacher; message?: string }> => {
  try {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب المعلم'
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

// Upload teacher avatar
export const uploadTeacherAvatar = async (id: string, avatarFile: File): Promise<{ success: boolean; message?: string }> => {
  try {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response = await api.post(`/teachers/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading teacher avatar:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء رفع الصورة'
    };
  }
};