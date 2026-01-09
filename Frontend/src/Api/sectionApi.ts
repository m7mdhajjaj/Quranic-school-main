import api from "./api";

// ============================================================================
// Section API - Daily Assignment Sections Management
// Note: Sections are now part of DailyMarks system
// Base URL: /api/daily-marks/sections
// ============================================================================

export interface Section {
  _id: string;
  date: string;
  memorizationSection: string;
  reviewSection: string;
  group?: string;
  teacher?: string;
  hasSchedule?: boolean;
  scheduleStatus?: 'scheduled' | 'needs_schedule';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSectionData {
  date: string;
  memorizationSection: string;
  reviewSection: string;
  group?: string;
  teacher?: string;
}

export interface UpdateSectionData extends Partial<CreateSectionData> {
  _id: string;
}

// Get all sections
export const getAllSections = async (): Promise<Section[]> => {
  try {
    const response = await api.get("/daily-marks/sections");
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Failed to get all sections:", error);
    return [];
  }
};

// Get sections by group
export const getSectionsByGroup = async (
  groupId: string
): Promise<Section[]> => {
  try {
    const response = await api.get(`/daily-marks/sections?group=${groupId}`);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Failed to get sections by group:", error);
    return [];
  }
};

// Get section by ID
export const getSectionById = async (
  sectionId: string
): Promise<Section | null> => {
  try {
    const response = await api.get(`/daily-marks/sections/${sectionId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to get section by ID:", error);
    return null;
  }
};

// Create new section
export const createSection = async (
  sectionData: CreateSectionData
): Promise<(Section & { meta?: any }) | null> => {
  try {
    const response = await api.post("/daily-marks/sections", sectionData);
    const data = response.data.data || response.data;
    if (response.data.meta) {
      return { ...data, meta: response.data.meta };
    }
    return data;
  } catch (error) {
    console.error("Failed to create section:", error);
    throw error;
  }
};

// Update section
export const updateSection = async (
  sectionId: string,
  sectionData: Partial<CreateSectionData>
): Promise<Section | null> => {
  try {
    const response = await api.put(`/daily-marks/sections/${sectionId}`, sectionData);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to update section:", error);
    throw error;
  }
};

// Delete section
export const deleteSection = async (sectionId: string): Promise<boolean> => {
  try {
    const response = await api.delete(`/daily-marks/sections/${sectionId}`);
    return response.data.success || true;
  } catch (error) {
    console.error("Failed to delete section:", error);
    throw error;
  }
};

// Get active sections
export const getActiveSections = async (): Promise<Section[]> => {
  try {
    const response = await api.get("/daily-marks/sections/active");
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Failed to get active sections:", error);
    return [];
  }
};

// Toggle section status
export const toggleSectionStatus = async (
  sectionId: string
): Promise<Section | null> => {
  try {
    const response = await api.patch(`/daily-marks/sections/${sectionId}/toggle-status`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to toggle section status:", error);
    throw error;
  }
};
