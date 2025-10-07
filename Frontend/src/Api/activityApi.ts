import api from './api';
import { AxiosError } from 'axios';

// ============================================================================
// Activities API
// ============================================================================

export interface Activity {
  _id?: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  image?: string;
  category?: string;
  participants?: string[];
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Get all activities
export const getAllActivities = async (): Promise<Activity[]> => {
  try {
    const response = await api.get('/activities');
    return response.data.success ? response.data.data || response.data : response.data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    throw new Error(axiosError.response?.data?.message || 'حدث خطأ أثناء جلب الأنشطة');
  }
};

// Create activity
export const createActivity = async (formData: FormData): Promise<Activity> => {
  try {
    const response = await api.post('/activities', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.success ? response.data.data : response.data;
  } catch (error) {
    console.error('Error creating activity:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    throw new Error(axiosError.response?.data?.message || 'حدث خطأ أثناء إنشاء النشاط');
  }
};

// Update activity
export const updateActivity = async (id: string, formData: FormData): Promise<Activity> => {
  try {
    const response = await api.put(`/activities/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.success ? response.data.data : response.data;
  } catch (error) {
    console.error('Error updating activity:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    throw new Error(axiosError.response?.data?.message || 'حدث خطأ أثناء تحديث النشاط');
  }
};

// Delete activity
export const deleteActivity = async (id: string): Promise<void> => {
  try {
    await api.delete(`/activities/${id}`);
  } catch (error) {
    console.error('Error deleting activity:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    throw new Error(axiosError.response?.data?.message || 'حدث خطأ أثناء حذف النشاط');
  }
};
