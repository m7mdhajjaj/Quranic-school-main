import api from "./api";

// ============================================================================
// Exam & Exam Marks API - Unified API for Exams and Exam Marks
// ============================================================================

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface Exam {
  _id?: string;
  id?: number;
  name: string;
  title?: string; // العنوان الجديد
  date: string | Date;
  time: string;
  result?: string;
  
  // تفاصيل الامتحان
  subject?: string; // المادة
  type?: string; // نوع الامتحان: شفهي، كتابي، عملي، مشروع
  duration?: number; // المدة بالدقائق
  totalMarks?: number; // مجموع الدرجات
  passingMarks?: number; // درجة النجاح
  
  // التخصيص
  group?: string; // اسم الحلقة
  teacher?: string; // معرف المعلم المسؤول
  
  // Marks - Now embedded as subdocuments
  marks?: ExamMark[];
  
  // الحالة والنتائج
  examAverage?: number | null; // متوسط علامات الامتحان
  isActive?: boolean; // حالة الامتحان
  isPublished?: boolean; // هل تم نشر النتائج
  
  // التواريخ
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentDoc {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

export interface ExamMark {
  _id?: string;
  exam?: string | Exam; // Optional now since marks are embedded
  student: string | StudentDoc;
  mark: string | number | null;
  percentage?: number; // النسبة المئوية للعلامة
  detail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamAverage {
  average: number | null;
  count: number;
}

export interface BulkMarksRequest {
  marks: Array<{
    student: string;
    mark: number | null;
    percentage?: number; // النسبة المئوية للعلامة
    detail?: string;
  }>;
}

export interface SingleMarkRequest {
  mark: number | null;
  percentage?: number; // النسبة المئوية للعلامة
  detail?: string;
}

export interface GroupStats {
  group: string;
  examCount: number;
  studentCount: number;
}

export interface TeacherGroupStudent {
  _id: string;
  studentId: string;
  name: string;
  firstName: string;
  lastName: string;
}

export interface TeacherGroup {
  _id: string;
  name: string;
  capacity?: number;
  description?: string;
  students: TeacherGroupStudent[];
  totalStudents: number;
  examCount: number;
  hasStudents: boolean;
}

export interface TeacherGroupsData {
  teacher: {
    _id: string;
    name: string;
  };
  groups: TeacherGroup[];
  summary: {
    totalGroups: number;
    totalStudents: number;
  };
}

export interface TeacherGroupsResponse {
  success: boolean;
  data: TeacherGroupsData;
}

// ============================================================================
// Exam Schedule API Functions
// ============================================================================

export interface ExamFilters {
  search?: string;
  sortBy?: "date" | "name";
  sortDir?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
  group?: string;
  teacher?: string;
}

/**
 * Get all exams with filters and sorting (server-side)
 * @route GET /api/exam-schedule
 */
export const getAllExams = async (filters?: ExamFilters): Promise<Exam[]> => {
  const params = new URLSearchParams();
  
  if (filters?.search) params.append("search", filters.search);
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortDir) params.append("sortDir", filters.sortDir);
  if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
  if (filters?.dateTo) params.append("dateTo", filters.dateTo);
  if (filters?.group) params.append("group", filters.group);
  if (filters?.teacher) params.append("teacher", filters.teacher);
  
  const queryString = params.toString();
  const url = queryString ? `/exam-schedule?${queryString}` : "/exam-schedule";
  
  const response = await api.get(url);
  return response.data;
};

/**
 * Get exams for current user (role-based filtering on backend)
 * @route GET /api/exam-schedule/my-exams
 */
export const getMyExams = async (search?: string, date?: string, type?: string, marksStatus?: string): Promise<Exam[]> => {
  const params = new URLSearchParams();
  
  if (search) params.append("search", search);
  if (date) params.append("date", date);
  if (type) params.append("type", type);
  if (marksStatus) params.append("marksStatus", marksStatus);
  
  const queryString = params.toString();
  const url = queryString ? `/exam-schedule/my-exams?${queryString}` : "/exam-schedule/my-exams";
  
  const response = await api.get(url);
  return response.data;
};

/**
 * Get exam count statistics for teacher's groups
 * @route GET /api/exam-schedule/groups-stats
 */
export const getGroupsStats = async (): Promise<GroupStats[]> => {
  const response = await api.get("/exam-schedule/groups-stats");
  return response.data.groupsStats || [];
};

/**
 * Get teacher's groups with students for marks management
 * @route GET /api/exam-schedule/marks/teacher-groups
 */
export const getTeacherGroupsForMarks = async (): Promise<TeacherGroupsResponse> => {
  const response = await api.get("/exam-schedule/marks/teacher-groups");
  return response.data;
};

/**
 * Get single exam by ID
 * @route GET /api/exam-schedule/:examId
 */
export const getExamById = async (examId: string): Promise<Exam> => {
  const response = await api.get(`/exam-schedule/${examId}`);
  return response.data;
};

/**
 * Create new exam
 * @route POST /api/exam-schedule
 */
export const createExam = async (exam: Omit<Exam, "_id" | "createdAt" | "updatedAt">): Promise<Exam> => {
  const response = await api.post("/exam-schedule", exam);
  return response.data.data || response.data; // Support both response formats
};

/**
 * Update existing exam
 * @route PUT /api/exam-schedule/:examId
 */
export const updateExam = async (
  examId: string,
  exam: Partial<Exam>
): Promise<Exam> => {
  const response = await api.put(`/exam-schedule/${examId}`, exam);
  return response.data.data || response.data; // Support both response formats
};

/**
 * Delete exam (also deletes all related marks)
 * @route DELETE /api/exam-schedule/:examId
 */
export const deleteExam = async (examId: string): Promise<void> => {
  await api.delete(`/exam-schedule/${examId}`);
};

/**
 * Bulk delete multiple exams
 * @route POST /api/exam-schedule/bulk-delete
 */
export const bulkDeleteExams = async (examIds: string[]): Promise<{
  success: boolean;
  message: string;
  deletedCount: number;
  requestedCount: number;
  notFound: number;
}> => {
  const response = await api.post('/exam-schedule/bulk-delete', { examIds });
  return response.data;
};

// ============================================================================
// Exam Marks API Functions
// ============================================================================

/**
 * Get all marks for a specific exam
 * @route GET /api/exam-schedule/marks/:examId
 */
export const getExamMarks = async (examId: string): Promise<ExamMark[]> => {
  const response = await api.get(`/exam-schedule/marks/${examId}`);
  return response.data;
};

/**
 * Get all marks for a specific student across all exams
 * @route GET /api/exam-schedule/marks/student/:studentId
 */
export const getStudentAllMarks = async (
  studentId: string
): Promise<ExamMark[]> => {
  const response = await api.get(`/exam-schedule/marks/student/${studentId}`);
  return response.data;
};

/**
 * Get exam average mark
 * @route GET /api/exam-schedule/marks/:examId/average
 */
export const getExamAverage = async (examId: string): Promise<ExamAverage> => {
  const response = await api.get(`/exam-schedule/marks/${examId}/average`);
  return response.data;
};

/**
 * Bulk save/update marks for multiple students in one exam
 * @route POST /api/exam-schedule/marks/:examId
 */
export const bulkSaveMarks = async (
  examId: string,
  data: BulkMarksRequest
): Promise<ExamMark[]> => {
  const response = await api.post(`/exam-schedule/marks/${examId}`, data);
  return response.data;
};

/**
 * Update single student mark
 * @route PUT /api/exam-schedule/marks/:examId/:studentId
 */
export const updateStudentMark = async (
  examId: string,
  studentId: string,
  data: SingleMarkRequest
): Promise<ExamMark> => {
  const response = await api.put(`/exam-schedule/marks/${examId}/${studentId}`, data);
  return response.data;
};

/**
 * Delete student mark
 * @route DELETE /api/exam-schedule/marks/:examId/:studentId
 */
export const deleteStudentMark = async (
  examId: string,
  studentId: string
): Promise<void> => {
  await api.delete(`/exam-schedule/marks/${examId}/${studentId}`);
};

/**
 * Get single student's mark for specific exam
 * @route GET /api/exam-schedule/marks/:examId/student/:studentId
 */
export const getStudentExamResult = async (
  examId: string,
  studentId: string
): Promise<ExamMark> => {
  const response = await api.get(`/exam-schedule/marks/${examId}/student/${studentId}`);
  return response.data;
};

// ============================================================================
// Helper/Utility Functions
// ============================================================================

/**
 * Check if exam has marks
 */
export const examHasMarks = async (examId: string): Promise<boolean> => {
  try {
    const marks = await getExamMarks(examId);
    return marks.length > 0;
  } catch {
    return false;
  }
};

/**
 * Get student's grade in specific exam
 */
export const getStudentGrade = async (
  examId: string,
  studentId: string
): Promise<string | null> => {
  try {
    const result = await getStudentExamResult(examId, studentId);
    if (!result || result.mark === null) return null;
    
    const mark = typeof result.mark === "string" ? parseFloat(result.mark) : result.mark;
    const exam = typeof result.exam === "object" ? result.exam : null;
    const totalMarks = exam && "totalMarks" in exam ? exam.totalMarks || 100 : 100;
    
    const percentage = (mark / totalMarks) * 100;
    
    if (percentage >= 90) return "ممتاز";
    if (percentage >= 80) return "جيد جداً";
    if (percentage >= 70) return "جيد";
    if (percentage >= 60) return "مقبول";
    return "راسب";
  } catch {
    return null;
  }
};

/**
 * Calculate pass/fail status
 */
export const isStudentPassed = async (
  examId: string,
  studentId: string
): Promise<boolean | null> => {
  try {
    const result = await getStudentExamResult(examId, studentId);
    if (!result || result.mark === null) return null;
    
    const mark = typeof result.mark === "string" ? parseFloat(result.mark) : result.mark;
    const exam = typeof result.exam === "object" ? result.exam : null;
    const passingMarks = exam && "passingMarks" in exam ? exam.passingMarks || 50 : 50;
    
    return mark >= passingMarks;
  } catch {
    return null;
  }
};

// ============================================================================
// Export all functions as default object for convenience
// ============================================================================

export default {
  // Exam Schedule
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  bulkDeleteExams,
  getGroupsStats,
  getTeacherGroupsForMarks,
  
  // Exam Marks
  getExamMarks,
  getStudentAllMarks,
  getExamAverage,
  bulkSaveMarks,
  updateStudentMark,
  deleteStudentMark,
  getStudentExamResult,
  
  // Helpers
  examHasMarks,
  getStudentGrade,
  isStudentPassed,
};
