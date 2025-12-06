import api from './api';

// ============================================================================
// TIMETABLE API (Sessions/TimeTable)
// ============================================================================
// API للجدول الزمني (مواعيد الحلقات)
// اسم الملف session للتوافق مع Backend routes (/sessions)

export interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface Session {
  _id?: string;
  day: string;
  startHour: string;
  endHour: string;
  note: string;
  groupId?: string;
  teacherId?: string | Teacher; // معرف المعلم أو بياناته الكاملة
  sessionType?: 'hifz' | 'murajaah' | 'both'; // حفظ، مراجعة، أو الاثنين
  createdAt?: string;
  updatedAt?: string;
}

export interface ConflictError {
  success: false;
  error: string;
  message: string;
  conflictDetails?: {
    day: string;
    startHour: string;
    endHour: string;
    note: string;
    timetableId: string;
  };
}

export interface GetSessionsResponse {
  success: boolean;
  timetables: Session[];
  teacherGroups: string[];
}

// Get all sessions - Backend filters by user role
export const getAllSessions = async (): Promise<GetSessionsResponse | Session[]> => {
  const response = await api.get('/sessions');
  return response.data;
};

// Create session
export const createSession = async (session: Omit<Session, '_id' | 'createdAt' | 'updatedAt'>): Promise<Session> => {
  try {
    const response = await api.post('/sessions', session);
    return response.data;
  } catch (error: any) {
    // Handle conflict errors (409)
    if (error.response?.status === 409) {
      throw {
        isConflict: true,
        ...error.response.data
      };
    }
    throw error;
  }
};

// Update session
export const updateSession = async (id: string, session: Partial<Session>): Promise<Session> => {
  try {
    const response = await api.put(`/sessions/${id}`, session);
    return response.data;
  } catch (error: any) {
    // Handle conflict errors (409)
    if (error.response?.status === 409) {
      throw {
        isConflict: true,
        ...error.response.data
      };
    }
    throw error;
  }
};

// Delete session
export const deleteSession = async (id: string): Promise<void> => {
  await api.delete(`/sessions/${id}`);
};