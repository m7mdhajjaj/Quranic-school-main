import api from "../api";

// ============================================================================
// Section API - Daily Assignment Sections Management
// Note: Sections are now part of DailyMarks system
// Base URL: /api/daily-marks/sections
// ============================================================================

// --- New Structured Types ---

export interface QuranSegment {
  _id?: string;
  surahNumber: number;
  surahNameCanonical: string;
  surahNameInput?: string;
  
  ayahStart: number;
  ayahEnd: number;
  
  canonicalKey?: string; // e.g. "114:1-6"
  surahAyahCount?: number;

  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: string;
  completedBy?: string;
  
  // Frontend helper (not in DB)
  description?: string; 
}

export interface ProgressSummary {
  memorization: {
    totalSegments: number;
    completedSegments: number;
  };
  review: {
    totalSegments: number;
    completedSegments: number;
  };
  lastUpdatedAt?: string;
}

// --- Main Interfaces ---

export interface Section {
  _id: string;
  date: string;
  
  // Legacy Strings (Display)
  memorizationSection: string;
  reviewSection: string;

  // New Structured Data (Source of Truth)
  memorizationMeta?: QuranSegment[];
  reviewMeta?: QuranSegment[];
  progressSummary?: ProgressSummary;

  group?: string;
  teacher?: string;
  hasSchedule?: boolean;
  scheduleStatus?: 'scheduled' | 'needs_schedule';
  timetableId?: {
    day: string;
    startHour: string;
    endHour: string;
    sessionType: string;
  };
  
  marksStatus?: 'completed' | 'in_progress' | 'not_started';
  marksProgress?: {
      totalStudents: number;
      studentsWithMarks: number;
      percentage: number;
  };

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSectionData {
  date: string;
  
  // Legacy fields (optional if Meta is provided, but good for display)
  memorizationSection?: string;
  reviewSection?: string;
  
  // New Structured Input
  memorizationMeta?: Partial<QuranSegment>[];
  reviewMeta?: Partial<QuranSegment>[];

  group?: string;
  teacher?: string;
  timetableId?: string;
  hasSchedule?: boolean;
  scheduleStatus?: 'scheduled' | 'needs_schedule';
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

/**
 * Get the last recorded segment to suggest the next step
 */
export const getLastSegment = async (
  group: string, 
  surah: number, 
  type: 'memorization' | 'review'
): Promise<{ nextStart: number; lastSegment?: QuranSegment } | null> => {
  try {
    const response = await api.get('/daily-marks/sections/last-segment', {
      params: { group, surah, type }
    });
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    // console.error("Failed to fetch last segment", error);
    return null;
  }
};
