import api from './api';

// ============================================================================
// Daily Marks API
// ============================================================================

export interface Mark {
  _id?: string;
  student: string;
  studentId?: any;
  sectionId?: any;
  date: string;
  surah?: string;
  ayahFrom?: number;
  ayahTo?: number;
  grade?: number;
  reviewMark?: number | null;
  memorizationMark?: number | null;
  note?: string;
  teacher?: string;
}

// Get all marks
export const getAllMarks = async (params?: {
  studentId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Mark[]> => {
  const response = await api.get('/marks', { params });
  return response.data;
};

// Get student marks
export const getStudentMarks = async (studentId: string): Promise<Mark[]> => {
  const response = await api.get(`/marks/student/${studentId}`);
  return response.data;
};

// Create mark
export const createMark = async (mark: Omit<Mark, '_id'>): Promise<Mark> => {
  const response = await api.post('/marks', mark);
  return response.data;
};

// Update mark
export const updateMark = async (id: string, mark: Partial<Mark>): Promise<Mark> => {
  const response = await api.put(`/marks/${id}`, mark);
  return response.data;
};

// Delete mark
export const deleteMark = async (id: string): Promise<void> => {
  await api.delete(`/marks/${id}`);
};
