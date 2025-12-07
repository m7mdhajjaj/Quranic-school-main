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
 * @route GET /api/exams
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
  const url = queryString ? `/exams?${queryString}` : "/exams";
  
  const response = await api.get(url);
  return response.data;
};

/**
 * Get exams for current user (role-based filtering on backend)
 * @route GET /api/exams/my-exams
 */
export const getMyExams = async (search?: string, date?: string, type?: string): Promise<Exam[]> => {
  const params = new URLSearchParams();
  
  if (search) params.append("search", search);
  if (date) params.append("date", date);
  if (type) params.append("type", type);
  
  const queryString = params.toString();
  const url = queryString ? `/exams/my-exams?${queryString}` : "/exams/my-exams";
  
  const response = await api.get(url);
  return response.data;
};

/**
 * Get single exam by ID
 * @route GET /api/exams/:examId
 */
export const getExamById = async (examId: string): Promise<Exam> => {
  const response = await api.get(`/exams/${examId}`);
  return response.data;
};

/**
 * Create new exam
 * @route POST /api/exams
 */
export const createExam = async (exam: Omit<Exam, "_id" | "createdAt" | "updatedAt">): Promise<Exam> => {
  const response = await api.post("/exams", exam);
  return response.data.data || response.data; // Support both response formats
};

/**
 * Update existing exam
 * @route PUT /api/exams/:examId
 */
export const updateExam = async (
  examId: string,
  exam: Partial<Exam>
): Promise<Exam> => {
  const response = await api.put(`/exams/${examId}`, exam);
  return response.data.data || response.data; // Support both response formats
};

/**
 * Delete exam (also deletes all related marks)
 * @route DELETE /api/exams/:examId
 */
export const deleteExam = async (examId: string): Promise<void> => {
  await api.delete(`/exams/${examId}`);
};

// ============================================================================
// Exam Marks API Functions
// ============================================================================

/**
 * Get all marks for a specific exam
 * @route GET /api/exam-marks/:examId
 */
export const getExamMarks = async (examId: string): Promise<ExamMark[]> => {
  const response = await api.get(`/exam-marks/${examId}`);
  return response.data;
};

/**
 * Get all marks for a specific student across all exams
 * @route GET /api/exam-marks/student/:studentId
 */
export const getStudentAllMarks = async (
  studentId: string
): Promise<ExamMark[]> => {
  const response = await api.get(`/exam-marks/student/${studentId}`);
  return response.data;
};

/**
 * Get exam average mark
 * @route GET /api/exam-marks/:examId/average
 */
export const getExamAverage = async (examId: string): Promise<ExamAverage> => {
  const response = await api.get(`/exam-marks/${examId}/average`);
  return response.data;
};

/**
 * Bulk save/update marks for multiple students in one exam
 * @route POST /api/exam-marks/:examId
 */
export const bulkSaveMarks = async (
  examId: string,
  data: BulkMarksRequest
): Promise<ExamMark[]> => {
  const response = await api.post(`/exam-marks/${examId}`, data);
  return response.data;
};

/**
 * Update single student mark
 * @route PUT /api/exam-marks/:examId/:studentId
 */
export const updateStudentMark = async (
  examId: string,
  studentId: string,
  data: SingleMarkRequest
): Promise<ExamMark> => {
  const response = await api.put(`/exam-marks/${examId}/${studentId}`, data);
  return response.data;
};

/**
 * Delete student mark
 * @route DELETE /api/exam-marks/:examId/:studentId
 */
export const deleteStudentMark = async (
  examId: string,
  studentId: string
): Promise<void> => {
  await api.delete(`/exam-marks/${examId}/${studentId}`);
};

/**
 * Get single student's mark for specific exam
 * @route GET /api/exam-marks/:examId/student/:studentId
 */
export const getStudentExamResult = async (
  examId: string,
  studentId: string
): Promise<ExamMark> => {
  const response = await api.get(`/exam-marks/${examId}/student/${studentId}`);
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
