import api from "../api";

// ============================================================================
// Section API - Daily Assignment Sections Management (V3)
// ============================================================================
// Note: Sections are now part of DailyMarks system
// Base URL: /api/daily-marks/sections
// 
// V3 Features:
// - ✅ Date-aware validation (chronological order)
// - ✅ Backfilling support (insert sections with past dates)
// - ✅ Neighbor segments API for context-aware UI
// - ✅ Auto-generation of dateKey & canonicalKey
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
  dateKey?: string; // ✅ V3: YYYY-MM-DD format for same-day comparison
  
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

  quranMetaVersion?: number; // ✅ V3: version 3
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
  groupId: string,
  period?: 'week' | 'all'
): Promise<Section[]> => {
  try {
    const response = await api.get(`/daily-marks/sections`, {
      params: { 
        group: groupId,
        period: period
      }
    }); // Updated to use params object
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Failed to get sections by group:", error);
    return [];
  }
};

// Also export the new signature for clarity if calling directly
export const getSectionsByGroupWithFilter = async (
  groupId: string,
  period?: 'week' | 'all'
): Promise<Section[]> => {
   return getSectionsByGroup(groupId, period);
}

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
): Promise<(Section & { meta?: any }) | null> => {
  try {
    const response = await api.put(`/daily-marks/sections/${sectionId}`, sectionData);
    const data = response.data.data || response.data;
    if (response.data.meta) {
        return { ...data, meta: response.data.meta };
    }
    return data;
  } catch (error) {
    console.error("Failed to update section:", error);
    throw error;
  }
};

// Delete section
export const deleteSection = async (id: string): Promise<boolean> => {
  try {
    const response = await api.delete(`/daily-marks/sections/${id}`);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || "فشل في حذف المقطع");
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
 * ✅ V3: Still supported for backward compatibility
 * Note: For date-aware context, use getNeighborSegments()
 */
export const getLastSegment = async (
  group: string, 
  surah: number, 
  type: 'memorization' | 'review',
  excludeId?: string
): Promise<{ nextStart: number; lastSegment?: QuranSegment; suggestedEnd?: number; maxMemorized?: number } | null> => {
  try {
    const response = await api.get('/daily-marks/sections/last-segment', {
      params: { group, surah, type, excludeId }
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

// ============================================================================
// ✅ V3: NEW ENDPOINTS - Backfilling Support
// ============================================================================

/**
 * Neighbor segment info (previous or next)
 */
export interface NeighborSegment {
  ayahStart: number;
  ayahEnd: number;
  canonicalKey: string;
  date: string;
  dateKey: string;
}

/**
 * Suggestions for insertion based on neighbors
 */
export interface InsertionSuggestions {
  canInsert: boolean;
  suggestedStart: number | null;
  suggestedEnd: number | null;
  reason: string;
}

/**
 * Response from getNeighborSegments API
 */
export interface NeighborSegmentsResponse {
  neighbors: {
    previous: NeighborSegment | null;
    next: NeighborSegment | null;
  };
  suggestions: InsertionSuggestions;
  context: {
    group: string;
    surahNumber: number;
    type: 'memorization' | 'review';
    targetDate: string;
  };
}

/**
 * ✅ V3: Get neighbor segments for backfilling validation
 * 
 * Returns the closest segments BEFORE and AFTER the specified date.
 * Useful for:
 * - Backfilling UI (show context)
 * - Validation preview
 * - Auto-suggestions based on chronological neighbors
 * 
 * @param group - اسم الحلقة
 * @param surah - رقم السورة (1-114)
 * @param type - 'memorization' or 'review'
 * @param date - التاريخ المستهدف (YYYY-MM-DD format)
 * 
 * @example
 * const neighbors = await getNeighborSegments('حلقة الإتقان', 2, 'memorization', '2026-01-10');
 * if (neighbors?.suggestions.canInsert) {
 *   console.log(`Suggested: ${neighbors.suggestions.suggestedStart}-${neighbors.suggestions.suggestedEnd}`);
 * }
 */
export const getNeighborSegments = async (
  group: string,
  surah: number,
  type: 'memorization' | 'review',
  date: string
): Promise<NeighborSegmentsResponse | null> => {
  try {
    const response = await api.get('/daily-marks/sections/neighbor-segments', {
      params: { group, surah, type, date }
    });
    
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch neighbor segments:", error);
    return null;
  }
};

/**
 * Check if adding a section is allowed based on Quota (Weekly/Daily)
 */
export const checkSectionQuota = async (
  group: string,
  date: string,
  excludeId?: string
): Promise<{ allowed: boolean; reason?: 'daily_limit' | 'weekly_limit'; message?: string }> => {
  try {
    const response = await api.get('/daily-marks/sections/check-quota', {
      params: { group, date, excludeId },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error checking quota:', error);
    // On error, we default to allowing (backend will perform final check)
    return { allowed: true };
  }
};

/**
 * 🤖 AI Auto-Repair Sequence
 * 
 * Attempts to fix sequence gaps and orphan reviews automatically
 * 
 * @param groupId - معرّف الحلقة (Group ID)
 * @param surahNumber - رقم السورة (Surah Number)
 * @param options - خيارات إضافية مثل الحد الأقصى للآيات (maxVersesPerDay)
 */
export const repairSequence = async (
  groupId: string,
  surahNumber?: number,
  options?: { 
    maxVersesPerDay?: number;
    suggestedDates?: string[]; // Array of YYYY-MM-DD
  }
): Promise<{ 
    repaired: boolean; 
    message: string; 
    stats?: { gapsFixed: number; orphansFixed: number };
    details?: string[];
} | null> => {
  try {
    const response = await api.post("/daily-marks/sections/repair-sequence", {
        groupId,
        surahNumber,
        options
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error("Failed to repair sequence:", error);
    throw error;
  }
};

// ============================================================================
// ✅ NEW: COMPLETED SURAHS & HISTORY
// ============================================================================

export interface CompletedSurah {
  surahNumber: number;
  surahName: string;
  totalAyahs: number;
  completedAt: string;
  type?: 'memorization' | 'review';
}

export interface SurahHistoryItem {
  date: string;
  ayahStart: number;
  ayahEnd: number;
  status: string;
}

/**
 * Get list of completed Surahs for a group
 */
export const getCompletedSurahs = async (group: string): Promise<CompletedSurah[]> => {
  try {
     const res = await api.get('/daily-marks/sections/completed-surahs', {
       params: { group }
     });
     return res.data.data || [];
  } catch (error) {
     console.error("Failed to fetch completed surahs", error);
     return [];
  }
};

/**
 * Get history of a specific Surah
 */
export const getSurahHistory = async (group: string, surah: number, type: 'memorization' | 'review' = 'memorization'): Promise<SurahHistoryItem[]> => {
  try {
     const res = await api.get('/daily-marks/sections/surah-history', {
       params: { group, surah, type }
     });
     return res.data.data || [];
  } catch (error) {
     console.error("Failed to fetch surah history", error);
     return [];
  }
};

