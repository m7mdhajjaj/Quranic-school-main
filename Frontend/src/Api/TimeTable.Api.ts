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
  description?: string;
  groupId?: string;
  teacherId?: string | Teacher; // معرف المعلم أو بياناته الكاملة
  sectionId?: string;
  sessionType?: 'hifz' | 'murajaah' | 'both'; // حفظ، مراجعة، أو الاثنين
  createdAt?: string;
  updatedAt?: string;
}

export interface AvailableHoursResponse {
  success: boolean;
  data: {
    isSummerTime: boolean;
    season: 'summer' | 'winter';
    seasonAr: string;
    range: string;
    hours: string[];
    totalSlots: number;
    currentMonth: number;
    currentDate: string;
  };
}

export interface TeacherAvailableHoursResponse {
  success: boolean;
  data: {
    isSummerTime: boolean;
    season: 'summer' | 'winter';
    seasonAr: string;
    teacherId: string;
    day: string;
    availableHours: string[];
    bookedSessions: Array<{
      _id: string;
      startHour: string;
      endHour: string;
      note: string;
    }>;
    totalSlots: number;
    bookedSlots: number;
    availableSlots: number;
  };
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

// Get available hours - الأوقات المتاحة حسب التوقيت الحالي (عامة)
export const getAvailableHours = async (): Promise<AvailableHoursResponse> => {
  const response = await api.get('/sessions/available-hours');
  return response.data;
};

// Get available hours for teacher - الأوقات المتاحة للمعلم في يوم معين (بعد حذف المحجوزة)
export const getAvailableHoursForTeacher = async (
  teacherId: string,
  day: string,
  excludeSessionId?: string
): Promise<TeacherAvailableHoursResponse> => {
  const params: any = { teacherId, day };
  if (excludeSessionId) {
    params.excludeSessionId = excludeSessionId;
  }
  const response = await api.get('/sessions/available-hours-teacher', { params });
  return response.data;
};

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