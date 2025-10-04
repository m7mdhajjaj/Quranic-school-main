// Group API functions
import api from "./api";
import { AxiosError } from "axios";

export interface Group {
  _id: string;
  name: string;
  teacher: string;
  teacherName?: string; // حقل إضافي للاسم
  description?: string;
  capacity?: number;
  schedule?: string;
  isActive: boolean;
  currentStudents?: number; // عدد الطلاب المشتركين في الحلقة
  isFull?: boolean; // هل الحلقة ممتلئة؟
  availableSpots?: number; // عدد الأماكن المتاحة
  capacityStatus?: string; // حالة السعة مثل "25/30"
  capacityPercentage?: number; // نسبة الإشغال المئوية
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
export const getAllGroups = async (): Promise<{
  success: boolean;
  data?: Group[];
  message?: string;
}> => {
  try {
    const response = await api.get("/groups");
    return response.data;
  } catch (error) {
    console.error("Error fetching groups:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "حدث خطأ أثناء جلب الحلقات",
    };
  }
};

// Get group by ID
export const getGroupById = async (
  id: string
): Promise<{ success: boolean; data?: Group; message?: string }> => {
  try {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching group:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب الحلقة",
    };
  }
};

// Get groups by teacher
export const getGroupsByTeacher = async (
  teacherName: string
): Promise<{ success: boolean; data?: Group[]; message?: string }> => {
  try {
    const response = await api.get(`/groups/teacher/${teacherName}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching groups by teacher:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "حدث خطأ أثناء جلب حلقات المعلم",
    };
  }
};

// Create new group
export const createGroup = async (
  groupData: GroupFormData
): Promise<{ success: boolean; data?: Group; message?: string }> => {
  try {
    console.log("📡 إرسال طلب إنشاء حلقة:", groupData);
    const response = await api.post("/groups", groupData);
    console.log("✅ نجح إنشاء الحلقة:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ خطأ في إنشاء الحلقة:", error);
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
      details?: Record<string, unknown>;
    }>;

    // تسجيل تفاصيل أكثر عن الخطأ
    if (axiosError.response) {
      console.error("📋 تفاصيل استجابة الخطأ:", {
        status: axiosError.response.status,
        data: axiosError.response.data,
        headers: axiosError.response.headers,
      });
    }

    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      "حدث خطأ أثناء إنشاء الحلقة";

    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Update group
export const updateGroup = async (
  id: string,
  groupData: Partial<GroupFormData>
): Promise<{ success: boolean; data?: Group; message?: string }> => {
  try {
    const response = await api.put(`/groups/${id}`, groupData);
    return response.data;
  } catch (error) {
    console.error("Error updating group:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "حدث خطأ أثناء تحديث الحلقة",
    };
  }
};

// Delete group
export const deleteGroup = async (
  id: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await api.delete(`/groups/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting group:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء حذف الحلقة",
    };
  }
};
