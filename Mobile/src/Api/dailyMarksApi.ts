import api from "./api";
import { AxiosError } from "axios";

/**
 * ============================================================================
 * DailyMarks API - Complete API Layer for DailyMarks Module
 * ============================================================================
 * 
 * This API module provides all functions needed for the refactored DailyMarks
 * component. It handles:
 * - Student data fetching
 * - Section (daily assignment) management
 * - Mark (grades) management
 * - Teacher data fetching
 * - Group filtering
 * 
 * All functions return standardized response format with error handling
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Student {
  _id: string;
  studentId: number;
  firstName: string;
  fatherName: string;
  lastName: string;
  group: string;
  teacher: string;
  email?: string;
  phoneNumber?: string;
  avatar?: { url?: string; publicId?: string };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Teacher {
  _id: string;
  teacherId: number;
  firstName: string;
  lastName: string;
  fatherName?: string;
  email: string;
  phoneNumber: string;
  groups?: string[];
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Section {
  _id: string;
  date: string;
  memorizationSection: string;
  reviewSection: string;
  group?: string;
  teacher?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Mark {
  _id: string;
  studentId: string | { _id: string };
  sectionId: string | { _id: string };
  reviewMark: number | null;
  memorizationMark: number | null;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================================================
// STUDENT API FUNCTIONS
// ============================================================================

/**
 * Get all students (or filtered by teacher)
 */
export const getAllStudents = async (): Promise<ApiResponse<Student[]>> => {
  try {
    const response = await api.get("/students");
    return {
      success: true,
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب الطلاب",
      error: String(error),
    };
  }
};

/**
 * Get student by ID
 */
export const getStudentById = async (
  studentId: string
): Promise<ApiResponse<Student>> => {
  try {
    const response = await api.get(`/students/${studentId}`);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("❌ Error fetching student:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب الطالب",
      error: String(error),
    };
  }
};

/**
 * Get students by teacher
 * @param teacherId - Teacher ID or name
 */
export const getStudentsByTeacher = async (
  teacherId: string
): Promise<ApiResponse<Student[]>> => {
  try {
    const response = await api.get(`/students/teacher/${encodeURIComponent(teacherId)}`);
    return {
      success: true,
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    console.error("❌ Error fetching students by teacher:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب طلاب المعلم",
      error: String(error),
    };
  }
};

/**
 * Get students by group
 */
export const getStudentsByGroup = async (
  groupName: string
): Promise<ApiResponse<Student[]>> => {
  try {
    const response = await api.get(
      `/students/group/${encodeURIComponent(groupName)}`
    );
    return {
      success: true,
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    console.error("❌ Error fetching students by group:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب طلاب الحلقة",
      error: String(error),
    };
  }
};

// ============================================================================
// TEACHER API FUNCTIONS
// ============================================================================

/**
 * Get teacher by ID
 */
export const getTeacherById = async (
  teacherId: string
): Promise<ApiResponse<Teacher>> => {
  try {
    const response = await api.get(`/teachers/${teacherId}`);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("❌ Error fetching teacher:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب المعلم",
      error: String(error),
    };
  }
};

/**
 * Get all teachers
 */
export const getAllTeachers = async (): Promise<ApiResponse<Teacher[]>> => {
  try {
    const response = await api.get("/teachers");
    return {
      success: true,
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    console.error("❌ Error fetching teachers:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب المعلمين",
      error: String(error),
    };
  }
};

// ============================================================================
// SECTION API FUNCTIONS
// ============================================================================

/**
 * Get all sections
 */
export const getAllSections = async (): Promise<ApiResponse<Section[]>> => {
  try {
    const response = await api.get("/sections");
    return {
      success: true,
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    console.error("❌ Error fetching sections:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب المقاطع",
      error: String(error),
    };
  }
};

/**
 * Get sections by group
 */
export const getSectionsByGroup = async (
  groupName: string
): Promise<ApiResponse<Section[]>> => {
  try {
    const response = await api.get(`/sections/group/${encodeURIComponent(groupName)}`);
    return {
      success: true,
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    console.error("❌ Error fetching sections by group:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب مقاطع الحلقة",
      error: String(error),
    };
  }
};

/**
 * Get section by ID
 */
export const getSectionById = async (
  sectionId: string
): Promise<ApiResponse<Section>> => {
  try {
    const response = await api.get(`/sections/${sectionId}`);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("❌ Error fetching section:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب المقطع",
      error: String(error),
    };
  }
};

/**
 * Create new section
 */
export const createSection = async (
  sectionData: Omit<Section, "_id" | "createdAt" | "updatedAt">
): Promise<ApiResponse<Section>> => {
  try {
    console.log("📤 Creating section:", sectionData);
    const response = await api.post("/sections", sectionData);
    return {
      success: true,
      data: response.data.data || response.data,
      message: "تم إنشاء المقطع بنجاح",
    };
  } catch (error) {
    console.error("❌ Error creating section:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء إنشاء المقطع",
      error: String(error),
    };
  }
};

/**
 * Update section
 */
export const updateSection = async (
  sectionId: string,
  sectionData: Partial<Omit<Section, "_id" | "createdAt" | "updatedAt">>
): Promise<ApiResponse<Section>> => {
  try {
    console.log("📝 Updating section:", sectionId, sectionData);
    const response = await api.put(`/sections/${sectionId}`, sectionData);
    return {
      success: true,
      data: response.data.data || response.data,
      message: "تم تحديث المقطع بنجاح",
    };
  } catch (error) {
    console.error("❌ Error updating section:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء تحديث المقطع",
      error: String(error),
    };
  }
};

/**
 * Delete section
 */
export const deleteSection = async (
  sectionId: string
): Promise<ApiResponse<{ deletedId: string }>> => {
  try {
    console.log("🗑️ Deleting section:", sectionId);
    await api.delete(`/sections/${sectionId}`);
    return {
      success: true,
      data: { deletedId: sectionId },
      message: "تم حذف المقطع بنجاح",
    };
  } catch (error) {
    console.error("❌ Error deleting section:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء حذف المقطع",
      error: String(error),
    };
  }
};

/**
 * Bulk delete sections
 */
export const bulkDeleteSections = async (
  sectionIds: string[]
): Promise<ApiResponse<{ deletedCount: number }>> => {
  try {
    console.log("🗑️ Bulk deleting sections:", sectionIds);
    await api.delete("/sections/bulk", {
      data: { sectionIds },
    });
    return {
      success: true,
      data: { deletedCount: sectionIds.length },
      message: `تم حذف ${sectionIds.length} مقطع بنجاح`,
    };
  } catch (error) {
    console.error("❌ Error bulk deleting sections:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء حذف المقاطع",
      error: String(error),
    };
  }
};

// ============================================================================
// MARK API FUNCTIONS
// ============================================================================

/**
 * Get all marks (or filtered by student/section)
 */
export const getAllMarks = async (): Promise<ApiResponse<Mark[]>> => {
  try {
    const response = await api.get("/daily-marks");
    return {
      success: true,
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    console.error("❌ Error fetching marks:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب العلامات",
      error: String(error),
    };
  }
};

/**
 * Get filtered marks with advanced filters
 * @param filters - Filter options
 * @param filters.month - Month (1-12)
 * @param filters.year - Year (e.g., 2024)
 * @param filters.search - Search in reviewSection or memorizationSection
 * @param filters.group - Filter by group name
 * @param filters.studentId - Filter by student ID
 * @param filters.page - Page number (default: 1)
 * @param filters.limit - Items per page (default: 100)
 */
export const getFilteredMarks = async (filters: {
  month?: number;
  year?: number;
  search?: string;
  group?: string;
  studentId?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Mark[]> & { pagination?: any; filters?: any }> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.month) params.append("month", filters.month.toString());
    if (filters.year) params.append("year", filters.year.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.group) params.append("group", filters.group);
    if (filters.studentId) params.append("studentId", filters.studentId);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    console.log("🔍 Fetching filtered marks:", filters);
    const response = await api.get(`/daily-marks/filtered?${params.toString()}`);
    
    return {
      success: true,
      data: response.data.data || response.data || [],
      pagination: response.data.pagination,
      filters: response.data.filters,
      message: response.data.message,
    };
  } catch (error) {
    console.error("❌ Error fetching filtered marks:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب العلامات المفلترة",
      error: String(error),
    };
  }
};

/**
 * Get filtered sections (without marks)
 * @param filters - Filter options
 * @param filters.month - Month (1-12)
 * @param filters.year - Year (e.g., 2024)
 * @param filters.search - Search in reviewSection or memorizationSection
 * @param filters.group - Filter by group name
 */
export const getFilteredSections = async (filters: {
  month?: number;
  year?: number;
  search?: string;
  group?: string;
}): Promise<ApiResponse<Section[]> & { count?: number; filters?: any }> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.month) params.append("month", filters.month.toString());
    if (filters.year) params.append("year", filters.year.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.group) params.append("group", filters.group);

    console.log("🔍 Fetching filtered sections:", filters);
    const response = await api.get(`/daily-marks/filtered-sections?${params.toString()}`);
    
    return {
      success: true,
      data: response.data.data || response.data || [],
      count: response.data.count,
      filters: response.data.filters,
      message: response.data.message,
    };
  } catch (error) {
    console.error("❌ Error fetching filtered sections:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب المقاطع المفلترة",
      error: String(error),
    };
  }
};

/**
 * Get student averages for filtered marks
 * @param studentId - Student ID
 * @param filters - Filter options
 * @param filters.month - Month (1-12)
 * @param filters.year - Year (e.g., 2024)
 * @param filters.group - Filter by group name
 */
export const getStudentAverages = async (
  studentId: string,
  filters: {
    month?: number;
    year?: number;
    group?: string;
  }
): Promise<ApiResponse<{
  reviewAverage: number;
  memorizationAverage: number;
  overallAverage: number;
  totalMarks: number;
  studentId: string;
  breakdown?: {
    reviewMarksCount: number;
    memorizationMarksCount: number;
  };
}> & { filters?: any }> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.month) params.append("month", filters.month.toString());
    if (filters.year) params.append("year", filters.year.toString());
    if (filters.group) params.append("group", filters.group);

    console.log("📊 Fetching student averages:", { studentId, ...filters });
    const response = await api.get(`/daily-marks/student/${studentId}/averages?${params.toString()}`);
    
    return {
      success: true,
      data: response.data.data,
      filters: response.data.filters,
      message: response.data.message,
    };
  } catch (error) {
    console.error("❌ Error fetching student averages:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب المعدلات",
      error: String(error),
    };
  }
};

/**
 * Get marks for a specific student
 */
export const getStudentMarks = async (
  studentId: string
): Promise<ApiResponse<Mark[]>> => {
  try {
    const response = await api.get(`/daily-marks/student/${studentId}`);
    return {
      success: true,
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    console.error("❌ Error fetching student marks:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب علامات الطالب",
      error: String(error),
    };
  }
};

/**
 * Get marks for a specific section
 */
export const getSectionMarks = async (
  sectionId: string
): Promise<ApiResponse<Mark[]>> => {
  try {
    const response = await api.get(`/daily-marks/section/${sectionId}`);
    return {
      success: true,
      data: response.data.data || response.data || [],
    };
  } catch (error) {
    console.error("❌ Error fetching section marks:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب علامات المقطع",
      error: String(error),
    };
  }
};

/**
 * Get mark statistics for a student
 */
export const getStudentMarkStats = async (
  studentId: string
): Promise<ApiResponse<{
  totalMarks: number;
  reviewMarkAverage: number;
  memorizationMarkAverage: number;
  overallAverage: number;
  reviewMarksCount: number;
  memorizationMarksCount: number;
}>> => {
  try {
    const response = await api.get(`/daily-marks/student/${studentId}/stats`);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("❌ Error fetching student mark statistics:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب إحصائيات الطالب",
      error: String(error),
    };
  }
};

/**
 * Create or update a single mark
 */
export const createMark = async (
  markData: Omit<Mark, "_id" | "createdAt" | "updatedAt">
): Promise<ApiResponse<Mark>> => {
  try {
    console.log("📤 Creating/Updating mark:", markData);
    const response = await api.post("/daily-marks", markData);
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "تم حفظ العلامة بنجاح",
    };
  } catch (error) {
    console.error("❌ Error creating mark:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء حفظ العلامة",
      error: String(error),
    };
  }
};

/**
 * Update mark by ID
 */
export const updateMark = async (
  markId: string,
  markData: Partial<Omit<Mark, "_id" | "createdAt" | "updatedAt">>
): Promise<ApiResponse<Mark>> => {
  try {
    console.log("📝 Updating mark:", markId, markData);
    const response = await api.put(`/daily-marks/${markId}`, markData);
    return {
      success: true,
      data: response.data.data || response.data,
      message: "تم تحديث العلامة بنجاح",
    };
  } catch (error) {
    console.error("❌ Error updating mark:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء تحديث العلامة",
      error: String(error),
    };
  }
};

/**
 * Delete mark by ID
 */
export const deleteMark = async (markId: string): Promise<ApiResponse<{ deletedId: string }>> => {
  try {
    console.log("🗑️ Deleting mark:", markId);
    const response = await api.delete(`/daily-marks/${markId}`);
    return {
      success: true,
      data: response.data.data || { deletedId: markId },
      message: "تم حذف العلامة بنجاح",
    };
  } catch (error) {
    console.error("❌ Error deleting mark:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء حذف العلامة",
      error: String(error),
    };
  }
};

/**
 * Bulk create/update marks
 */
export const bulkCreateMarks = async (
  marksData: Array<Omit<Mark, "_id" | "createdAt" | "updatedAt">>
): Promise<ApiResponse<Mark[]>> => {
  try {
    console.log("📤 Bulk creating marks:", marksData);
    const response = await api.post("/daily-marks/bulk", { marks: marksData });
    return {
      success: true,
      data: response.data.data || response.data || [],
      message: response.data.message || `تم إضافة ${marksData.length} علامة بنجاح`,
    };
  } catch (error) {
    console.error("❌ Error bulk creating marks:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء إضافة العلامات",
      error: String(error),
    };
  }
};

/**
 * Bulk update marks
 */
export const bulkUpdateMarks = async (
  marksData: Array<{ id: string; reviewMark?: number | null; memorizationMark?: number | null }>
): Promise<ApiResponse<Mark[]>> => {
  try {
    console.log("📝 Bulk updating marks:", marksData);
    const response = await api.put("/daily-marks/bulk", { marks: marksData });
    return {
      success: true,
      data: response.data.data || response.data || [],
      message: response.data.message || `تم تحديث ${marksData.length} علامة بنجاح`,
    };
  } catch (error) {
    console.error("❌ Error bulk updating marks:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء تحديث العلامات",
      error: String(error),
    };
  }
};

/**
 * Delete all marks for a student
 */
export const deleteStudentMarks = async (
  studentId: string
): Promise<ApiResponse<{ deletedCount: number; studentId: string }>> => {
  try {
    console.log("🗑️ Deleting all marks for student:", studentId);
    const response = await api.delete(`/daily-marks/student/${studentId}`);
    return {
      success: true,
      data: response.data.data || { deletedCount: 0, studentId },
      message: response.data.message || "تم حذف العلامات بنجاح",
    };
  } catch (error) {
    console.error("❌ Error deleting student marks:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء حذف علامات الطالب",
      error: String(error),
    };
  }
};

/**
 * Delete all marks for a section
 */
export const deleteSectionMarks = async (
  sectionId: string
): Promise<ApiResponse<{ deletedCount: number; sectionId: string; affectedStudents: number }>> => {
  try {
    console.log("🗑️ Deleting all marks for section:", sectionId);
    const response = await api.delete(`/daily-marks/section/${sectionId}`);
    return {
      success: true,
      data: response.data.data || { deletedCount: 0, sectionId, affectedStudents: 0 },
      message: response.data.message || "تم حذف العلامات بنجاح",
    };
  } catch (error) {
    console.error("❌ Error deleting section marks:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء حذف علامات القسم",
      error: String(error),
    };
  }
};

/**
 * Delete a mark for specific student in specific section
 */
export const deleteStudentSectionMark = async (
  studentId: string,
  sectionId: string
): Promise<ApiResponse<{ deletedId: string; studentId: string; sectionId: string }>> => {
  try {
    console.log(`🗑️ Deleting mark for student ${studentId} in section ${sectionId}`);
    const response = await api.delete(`/daily-marks/student/${studentId}/section/${sectionId}`);
    return {
      success: true,
      data: response.data.data || { deletedId: "", studentId, sectionId },
      message: response.data.message || "تم حذف العلامة بنجاح",
    };
  } catch (error) {
    console.error("❌ Error deleting student section mark:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء حذف العلامة",
      error: String(error),
    };
  }
};

/**
 * Set marks for a specific section (bulk operation for one section)
 */
export const setMarksForSection = async (
  sectionId: string,
  marksData: Array<{ studentId: string; reviewMark?: number | null; memorizationMark?: number | null }>
): Promise<ApiResponse<Mark[]>> => {
  try {
    console.log(`📤 Setting marks for section ${sectionId}:`, marksData);
    const response = await api.post(`/daily-marks/section/${sectionId}`, { marks: marksData });
    return {
      success: true,
      data: response.data.data || response.data || [],
      message: response.data.message || `تم حفظ ${marksData.length} علامة بنجاح`,
    };
  } catch (error) {
    console.error("❌ Error setting marks for section:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء حفظ العلامات",
      error: String(error),
    };
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all data needed for DailyMarks initialization
 */
export const getDailyMarksInitialData = async (
  teacherId?: string
): Promise<{
  students: Student[];
  sections: Section[];
  marks: Mark[];
  teacher?: Teacher;
}> => {
  try {
    console.log("📦 Fetching DailyMarks initial data...");

    const [studentsRes, sectionsRes, marksRes, teacherRes] = await Promise.all([
      teacherId
        ? getStudentsByTeacher(teacherId)
        : getAllStudents(),
      getAllSections(),
      getAllMarks(),
      teacherId ? getTeacherById(teacherId) : Promise.resolve({ success: false } as ApiResponse<Teacher>),
    ]);

    const teacher = (teacherRes as ApiResponse<Teacher>).success && (teacherRes as ApiResponse<Teacher>).data 
      ? (teacherRes as ApiResponse<Teacher>).data 
      : undefined;

    return {
      students: studentsRes.data || [],
      sections: sectionsRes.data || [],
      marks: marksRes.data || [],
      teacher,
    };
  } catch (error) {
    console.error("❌ Error fetching initial data:", error);
    throw error;
  }
};

export default {
  // Students
  getAllStudents,
  getStudentById,
  getStudentsByTeacher,
  getStudentsByGroup,

  // Teachers
  getTeacherById,
  getAllTeachers,

  // Sections
  getAllSections,
  getSectionsByGroup,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  bulkDeleteSections,

  // Marks
  getAllMarks,
  getFilteredMarks,
  getFilteredSections,
  getStudentAverages,
  getStudentMarks,
  getSectionMarks,
  getStudentMarkStats,
  createMark,
  updateMark,
  deleteMark,
  bulkCreateMarks,
  bulkUpdateMarks,
  deleteStudentMarks,
  deleteSectionMarks,
  deleteStudentSectionMark,
  setMarksForSection,

  // Utility
  getDailyMarksInitialData,
};
