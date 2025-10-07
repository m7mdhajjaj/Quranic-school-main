import api from '../api';

// ============================================================================
// Session/Timetable API
// ============================================================================

export interface Session {
  _id?: string;
  day: string;
  startHour: string;
  endHour: string;
  note: string;
}

// Get all sessions
export const getAllSessions = async (): Promise<Session[]> => {
  const response = await api.get('/sessions');
  return response.data;
};

// Create session
export const createSession = async (session: Omit<Session, '_id'>): Promise<Session> => {
  const response = await api.post('/sessions', session);
  return response.data;
};

// Update session
export const updateSession = async (id: string, session: Partial<Session>): Promise<Session> => {
  const response = await api.put(`/sessions/${id}`, session);
  return response.data;
};

// Delete session
export const deleteSession = async (id: string): Promise<void> => {
  await api.delete(`/sessions/${id}`);
};
