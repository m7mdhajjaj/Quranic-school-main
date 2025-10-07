import api from './api';

// ============================================================================
// Section API (Daily Assignments)
// ============================================================================

export interface Section {
  _id: string;
  date: string;
  memorizationSection: string;
  reviewSection: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get all sections
export const getAllSections = async (): Promise<Section[]> => {
  const response = await api.get('/sections');
  return response.data;
};

// Create a new section
export const createSection = async (data: {
  date: string;
  memorizationSection: string;
  reviewSection: string;
}): Promise<Section> => {
  const response = await api.post('/sections', data);
  return response.data;
};

// Update a section
export const updateSection = async (
  sectionId: string,
  data: { date: string; memorizationSection: string; reviewSection: string }
): Promise<Section> => {
  const response = await api.put(`/sections/${sectionId}`, data);
  return response.data;
};

// Delete a section
export const deleteSection = async (sectionId: string): Promise<void> => {
  await api.delete(`/sections/${sectionId}`);
};

// Get section by ID
export const getSectionById = async (sectionId: string): Promise<Section> => {
  const response = await api.get(`/sections/${sectionId}`);
  return response.data;
};
