import api from "./api";
import { AxiosError } from "axios";

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
  imagePublicId?: string;
  category?: string;
  participants?: string[];
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Get all activities
export const getAllActivities = async (): Promise<Activity[]> => {
  try {
    const response = await api.get("/activities");
    return response.data.success
      ? response.data.data || response.data
      : response.data;
  } catch (error) {
    console.error("Error fetching activities:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message || "حدث خطأ أثناء جلب الأنشطة"
    );
  }
};

// Create activity (now accepts both FormData and plain object)
export const createActivity = async (
  data: FormData | Partial<Activity>
): Promise<Activity> => {
  try {
    const isFormData = data instanceof FormData;
    
    console.log("Creating activity with data:", data);
    console.log("Is FormData?", isFormData);
    
    const response = await api.post("/activities", data, {
      headers: isFormData
        ? {
            "Content-Type": "multipart/form-data",
          }
        : undefined, // Let axios set default headers for JSON
    });
    return response.data.activity || response.data.data || response.data;
  } catch (error) {
    console.error("Error creating activity:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message || "حدث خطأ أثناء إنشاء النشاط"
    );
  }
};

// Update activity (now accepts both FormData and plain object)
export const updateActivity = async (
  id: string,
  data: FormData | Partial<Activity>
): Promise<Activity> => {
  try {
    const isFormData = data instanceof FormData;
    
    console.log("Updating activity with data:", data);
    console.log("Is FormData?", isFormData);
    
    const response = await api.put(`/activities/${id}`, data, {
      headers: isFormData
        ? {
            "Content-Type": "multipart/form-data",
          }
        : undefined, // Let axios set default headers for JSON
    });
    return response.data.activity || response.data.data || response.data;
  } catch (error) {
    console.error("Error updating activity:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message || "حدث خطأ أثناء تحديث النشاط"
    );
  }
};

// Delete activity
export const deleteActivity = async (id: string): Promise<void> => {
  try {
    await api.delete(`/activities/${id}`);
  } catch (error) {
    console.error("Error deleting activity:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message || "حدث خطأ أثناء حذف النشاط"
    );
  }
};
