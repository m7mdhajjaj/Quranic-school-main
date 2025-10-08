import api from './api';

// ============================================================================
// Goals API
// ============================================================================

export interface Goal {
  _id?: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: 'memorization' | 'reading' | 'understanding' | 'behavior';
  priority: 'high' | 'medium' | 'low';
  deadline?: Date;
  completed: boolean;
  studentId?: string;
  teacherId?: string;
  groupId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GoalProgress {
  _id?: string;
  goalId: string;
  progress: number;
  notes: string;
  date: Date;
  recordedBy: string;
}

// Get all goals
export const getAllGoals = async (): Promise<Goal[]> => {
  const response = await api.get('/goals');
  return response.data;
};

// Get goals by student
export const getGoalsByStudent = async (studentId: string): Promise<Goal[]> => {
  const response = await api.get(`/goals/student/${studentId}`);
  return response.data;
};

// Get goals by teacher
export const getGoalsByTeacher = async (teacherId: string): Promise<Goal[]> => {
  const response = await api.get(`/goals/teacher/${teacherId}`);
  return response.data;
};

// Get goals by group
export const getGoalsByGroup = async (groupId: string): Promise<Goal[]> => {
  const response = await api.get(`/goals/group/${groupId}`);
  return response.data;
};

// Create goal
export const createGoal = async (goal: Omit<Goal, '_id' | 'createdAt' | 'updatedAt'>): Promise<Goal> => {
  const response = await api.post('/goals', goal);
  return response.data;
};

// Update goal
export const updateGoal = async (id: string, goal: Partial<Goal>): Promise<Goal> => {
  const response = await api.put(`/goals/${id}`, goal);
  return response.data;
};

// Delete goal
export const deleteGoal = async (id: string): Promise<void> => {
  await api.delete(`/goals/${id}`);
};

// Update goal progress
export const updateGoalProgress = async (id: string, progress: number, notes?: string): Promise<Goal> => {
  const response = await api.patch(`/goals/${id}/progress`, { progress, notes });
  return response.data;
};

// Get goal progress history
export const getGoalProgressHistory = async (goalId: string): Promise<GoalProgress[]> => {
  const response = await api.get(`/goals/${goalId}/progress`);
  return response.data;
};

// Complete goal
export const completeGoal = async (id: string): Promise<Goal> => {
  const response = await api.patch(`/goals/${id}/complete`);
  return response.data;
};