// Group API functions
import api from './api';
import { AxiosError } from 'axios';

export interface Group {
  _id: string;
  name: string;
  teacher: string;
  description?: string;
  capacity?: number;
  schedule?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupFormData {
  name: string;
  teacher: string;
  description?: string;
  capacity?: number;
  schedule?: string;
  isActive?: boolean;
}

// Get all groups
export const getAllGroups = async (): Promise<{ success: boolean; data?: Group[]; message?: string }> => {
  try {
    const response = await api.get('/groups');
    return response.data;
  } catch (error) {
    console.error('Error fetching groups:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب الحلقات'
    };
  }
};

// Get group by ID
export const getGroupById = async (id: string): Promise<{ success: boolean; data?: Group; message?: string }> => {
  try {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching group:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب الحلقة'
    };
  }
};

// Get groups by teacher
export const getGroupsByTeacher = async (teacherName: string): Promise<{ success: boolean; data?: Group[]; message?: string }> => {
  try {
    const response = await api.get(`/groups/teacher/${teacherName}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching groups by teacher:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب حلقات المعلم'
    };
  }
};

// Create new group
export const createGroup = async (groupData: GroupFormData): Promise<{ success: boolean; data?: Group; message?: string }> => {
  try {
    const response = await api.post('/groups', groupData);
    return response.data;
  } catch (error) {
    console.error('Error creating group:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء إنشاء الحلقة'
    };
  }
};

// Update group
export const updateGroup = async (id: string, groupData: Partial<GroupFormData>): Promise<{ success: boolean; data?: Group; message?: string }> => {
  try {
    const response = await api.put(`/groups/${id}`, groupData);
    return response.data;
  } catch (error) {
    console.error('Error updating group:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء تحديث الحلقة'
    };
  }
};

// Delete group
export const deleteGroup = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await api.delete(`/groups/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting group:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء حذف الحلقة'
    };
  }
};