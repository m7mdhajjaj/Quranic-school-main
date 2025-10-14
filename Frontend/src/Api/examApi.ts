import api from "./api";

// ============================================================================
// Exam API
// ============================================================================

export interface Exam {
  _id?: string;
  id?: number;
  name: string;
  date: string;
  time: string;
  result?: string;
  group?: string; // اسم الحلقة
  examAverage?: number | null; // متوسط علامات الامتحان
}

export interface StudentDoc {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

export interface MarkRow {
  _id?: string;
  exam: string | Exam;
  student: string | StudentDoc;
  mark: string | number | null;
  detail?: string;
}

export interface ExamAverage {
  average: number;
  count: number;
}

export interface BulkMarksRequest {
  marks: Array<{
    student: string;
    mark: number | null;
    detail?: string;
  }>;
}

// Get all exams
export const getAllExams = async (): Promise<Exam[]> => {
  const response = await api.get("/exams");
  return response.data;
};

// Create exam
export const createExam = async (exam: Omit<Exam, "_id">): Promise<Exam> => {
  const response = await api.post("/exams", exam);
  return response.data;
};

// Update exam
export const updateExam = async (
  examId: string,
  exam: Partial<Exam>
): Promise<Exam> => {
  const response = await api.put(`/exams/${examId}`, exam);
  return response.data;
};

// Delete exam
export const deleteExam = async (examId: string): Promise<void> => {
  await api.delete(`/exams/${examId}`);
};

// Get exam marks for a specific exam
export const getExamMarks = async (examId: string): Promise<MarkRow[]> => {
  const response = await api.get(`/exam-marks/${examId}`);
  return response.data;
};

// Get exam average
export const getExamAverage = async (examId: string): Promise<ExamAverage> => {
  const response = await api.get(`/exam-marks/${examId}/average`);
  return response.data;
};

// Bulk save marks for multiple students
export const bulkSaveMarks = async (
  examId: string,
  data: BulkMarksRequest
): Promise<MarkRow[]> => {
  const response = await api.post(`/exam-marks/${examId}`, data);
  return response.data;
};

// Update single student mark
export const updateStudentMark = async (
  examId: string,
  studentId: string,
  data: { mark: number | null; detail?: string }
): Promise<MarkRow> => {
  const response = await api.put(`/exam-marks/${examId}/${studentId}`, data);
  return response.data;
};

// Delete student mark
export const deleteStudentMark = async (
  examId: string,
  studentId: string
): Promise<void> => {
  await api.delete(`/exam-marks/${examId}/${studentId}`);
};

// Get student's exam result
export const getStudentExamResult = async (
  examId: string,
  studentId: string
): Promise<MarkRow> => {
  const response = await api.get(`/exam-marks/${examId}/student/${studentId}`);
  return response.data;
};

// Get all marks for a student across all exams
export const getStudentAllMarks = async (
  studentId: string
): Promise<MarkRow[]> => {
  const response = await api.get(`/exam-marks/student/${studentId}`);
  return response.data;
};
