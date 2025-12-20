// Student API functions
import api from "./api";
import type { StudentFormData } from "../Validation/studentValidation";
import { AxiosError } from "axios";

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
  teacherFullName?: string; // اسم المعلم الثلاثي من الحلقة
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

// Get all students with optional filters
export const getAllStudents = async (filters?: {
  gender?: string;
  minAge?: number;
  maxAge?: number;
  group?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data?: Student[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  message?: string;
}> => {
  try {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.minAge) params.append('minAge', filters.minAge.toString());
      if (filters.maxAge) params.append('maxAge', filters.maxAge.toString());
      if (filters.group) params.append('group', filters.group);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
    }
    
    const url = params.toString() ? `/students?${params}` : '/students';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب الطلاب",
    };
  }
};

// Get student by ID
export const getStudentById = async (
  id: string
): Promise<{ success: boolean; data?: Student; message?: string }> => {
  try {
    const response = await api.get(`/students/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب الطالب",
    };
  }
};

// Check if field value is duplicate
export const checkDuplicateField = async (
  field: 'idNumber' | 'phoneNumber' | 'email',
  value: string,
  excludeId?: string
): Promise<{ success: boolean; isDuplicate: boolean; message?: string; existingUserType?: string }> => {
  try {
    const params = new URLSearchParams({ field, value });
    if (excludeId) params.append('excludeId', excludeId);
    
    const response = await api.get(`/students/check-duplicate?${params}`);
    return response.data;
  } catch (error) {
    console.error("خطأ في التحقق من التكرار:", error);
    return {
      success: false,
      isDuplicate: false,
      message: "حدث خطأ أثناء التحقق",
    };
  }
};

// Create new student
export const createStudent = async (
  studentData: StudentFormData
): Promise<{ success: boolean; data?: Student; message?: string }> => {
  try {
    console.log(
      "📤 إرسال بيانات الطالب إلى الخادم:",
      JSON.stringify(studentData, null, 2)
    );
    
    const response = await api.post("/students", studentData);
    console.log("✅ استجابة الخادم:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ خطأ في إضافة الطالب:", error);
    const axiosError = error as AxiosError<{ message?: string; error?: string; details?: any }>;
    
    // Log detailed error information
    if (axiosError.response) {
      console.error("📋 تفاصيل الخطأ من السيرفر:", {
        status: axiosError.response.status,
        errorMessage: axiosError.response.data?.message || axiosError.response.data?.error,
        errorDetails: axiosError.response.data?.details,
        fullResponse: axiosError.response.data,
      });
      console.error("📤 البيانات المرسلة:", studentData);
    }
    
    const errorMessage = axiosError.response?.data?.message || 
                        axiosError.response?.data?.error || 
                        "حدث خطأ أثناء إضافة الطالب";
    
    console.error("💬 رسالة الخطأ النهائية:", errorMessage);
    
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Update student
export const updateStudent = async (
  id: string,
  studentData: Partial<StudentFormData>
): Promise<{ success: boolean; data?: Student; message?: string }> => {
  try {
    console.log("📤 تحديث بيانات الطالب:", { id, data: studentData });
    const response = await api.put(`/students/${id}`, studentData);
    console.log("✅ تم تحديث الطالب بنجاح");
    return response.data;
  } catch (error) {
    console.error("❌ خطأ في تحديث الطالب:", error);
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    
    if (axiosError.response) {
      console.error("📋 تفاصيل الخطأ:", {
        status: axiosError.response.status,
        data: axiosError.response.data,
      });
    }
    
    return {
      success: false,
      message: axiosError.response?.data?.message || 
               axiosError.response?.data?.error || 
               "حدث خطأ أثناء تحديث الطالب",
    };
  }
};

// Delete student
export const deleteStudent = async (
  id: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting student:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء حذف الطالب",
    };
  }
};

// Get student statistics (old endpoint - deprecated)
export const getStudentStats = async (): Promise<{
  success: boolean;
  data?: StudentStats;
  message?: string;
}> => {
  try {
    const response = await api.get("/students/stats/summary/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching student stats:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message ||
        "حدث خطأ أثناء جلب إحصائيات الطلاب",
    };
  }
};

// Get students statistics with filters (NEW - server-side)
export const getStudentsStatistics = async (filters?: {
  gender?: string;
  minAge?: number;
  maxAge?: number;
  group?: string;
  search?: string;
}): Promise<{
  success: boolean;
  data?: {
    total: number;
    male: number;
    female: number;
    active: number;
    inactive: number;
    avgAge: string | number;
  };
  message?: string;
}> => {
  try {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.minAge) params.append('minAge', filters.minAge.toString());
      if (filters.maxAge) params.append('maxAge', filters.maxAge.toString());
      if (filters.group) params.append('group', filters.group);
      if (filters.search) params.append('search', filters.search);
    }
    
    const url = params.toString() ? `/students/statistics?${params}` : '/students/statistics';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching statistics:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب الإحصائيات",
    };
  }
};

// Get students by group
export const getStudentsByGroup = async (
  groupName: string
): Promise<{ success: boolean; data?: Student[]; message?: string }> => {
  try {
    const response = await api.get(
      `/students/group/${encodeURIComponent(groupName)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching students by group:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "حدث خطأ أثناء جلب طلاب الحلقة",
    };
  }
};

// Get students by teacher
export const getStudentsByTeacher = async (
  teacherName: string
): Promise<{ success: boolean; data?: Student[]; message?: string }> => {
  try {
    const response = await api.get(
      `/students/teacher/${encodeURIComponent(teacherName)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching students by teacher:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "حدث خطأ أثناء جلب طلاب المعلم",
    };
  }
};

// Upload student avatar
export const uploadStudentAvatar = async (
  id: string,
  avatarFile: File
): Promise<{ success: boolean; message?: string }> => {
  try {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const response = await api.post(`/students/${id}/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading student avatar:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء رفع الصورة",
    };
  }
};

// Search students
export const searchStudents = async (
  query: string
): Promise<{ success: boolean; data?: Student[]; message?: string }> => {
  try {
    const response = await api.get(
      `/students/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error searching students:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "حدث خطأ أثناء البحث عن الطلاب",
    };
  }
};

// Toggle student active status
export const toggleStudentStatus = async (
  id: string
): Promise<{ success: boolean; data?: Student; message?: string }> => {
  try {
    const response = await api.patch(`/students/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error("Error toggling student status:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "حدث خطأ أثناء تغيير حالة الطالب",
    };
  }
};

// Bulk operations
export const bulkDeleteStudents = async (
  studentIds: string[]
): Promise<{ success: boolean; deletedCount?: number; message?: string }> => {
  try {
    const response = await api.delete("/students/bulk", {
      data: { studentIds },
    });
    return response.data;
  } catch (error) {
    console.error("Error bulk deleting students:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء حذف الطلاب",
    };
  }
};

export const bulkUpdateStudents = async (
  updates: Array<{ id: string; data: Partial<StudentFormData> }>
): Promise<{ success: boolean; updatedCount?: number; message?: string }> => {
  try {
    const response = await api.patch("/students/bulk", { updates });
    return response.data;
  } catch (error) {
    console.error("Error bulk updating students:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "حدث خطأ أثناء تحديث الطلاب",
    };
  }
};

// ⚡ OPTIMIZED - Get students with absence statistics (for Absence page)
export interface StudentWithAbsenceStats {
  _id: string;
  studentId: number;
  name: string;
  group?: string;
  teacher?: string;
  totalAbsences: number;
  absenceDates: Date[];
}

export const getStudentsWithAbsenceStats = async (
  teacher?: string,
  group?: string
): Promise<StudentWithAbsenceStats[]> => {
  try {
    console.log("⚡ [OPTIMIZED API] جلب الطلاب مع إحصائيات الغياب...");
    const startTime = Date.now();

    const params = new URLSearchParams();
    if (teacher) params.append("teacher", teacher);
    if (group && group !== "all") params.append("group", group);

    const url = `/students/with-absence-stats${
      params.toString() ? `?${params}` : ""
    }`;
    const response = await api.get(url);

    const duration = Date.now() - startTime;
    console.log(
      `✅ [OPTIMIZED API] تم جلب ${response.data.length} طالب في ${duration}ms`
    );

    return response.data;
  } catch (error) {
    console.error("❌ خطأ في جلب الطلاب مع الإحصائيات:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message || "حدث خطأ أثناء جلب بيانات الطلاب"
    );
  }
};

/**
 * Export students to CSV
 */
export const exportStudentsToCSV = async (filters?: {
  gender?: string;
  minAge?: number;
  maxAge?: number;
  group?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  try {
    console.log("📥 تصدير الطلاب إلى CSV...");
    
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'all') {
          params.append(key, String(value));
        }
      });
    }

    const url = `/students/export${params.toString() ? `?${params}` : ''}`;
    
    // Download file directly
    const response = await api.get(url, {
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
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

// ============================================================================
// Student History APIs
// ============================================================================

/**
 * جلب تاريخ طالب كامل (History)
 * @route GET /api/students/:studentId/history
 */
export const getStudentHistory = async (
  studentId: string,
  options?: {
    eventType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
) => {
  const params = new URLSearchParams();
  if (options?.eventType) params.append('eventType', options.eventType);
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);
  if (options?.limit) params.append('limit', options.limit.toString());

  const queryString = params.toString();
  const url = `/students/${studentId}/history${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get(url);
  return response.data;
};

/**
 * جلب إحصائيات تاريخ الطالب
 * @route GET /api/students/:studentId/history/stats
 */
export const getStudentHistoryStats = async (studentId: string) => {
  const response = await api.get(`/students/${studentId}/history/stats`);
  return response.data;
};

/**
 * إرجاع طالب مفصول للحلقة (Admin only)
 * @route POST /api/students/:studentId/restore
 */
export const restoreStudentToGroup = async (
  studentId: string,
  data: {
    groupId: string;
    reason?: string;
  }
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post(`/students/${studentId}/restore`, data);
    return response.data;
  } catch (error) {
    console.error("Error restoring student:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(axiosError.response?.data?.message || "حدث خطأ أثناء إرجاع الطالب");
  }
};
