import api from "../api";

// ============================================================================
// Student Grouped Sections API
// ============================================================================

export interface SurahSegment {
  segmentId: string;
  sectionId: string;
  sectionDate: string;
  type: "memorization" | "review";
  ayahStart: number;
  ayahEnd: number;
  canonicalKey: string;
  status: "not_started" | "in_progress" | "completed";
  mark: {
    memorizationMark: number | null;
    reviewMark: number | null;
    _id: string;
    seenAt?: string | null;
  } | null;
  sectionInfo: {
    group: string;
    teacher: string;
    marksStatus: string;
  };
}

export interface GroupedSurah {
  surahNumber: number;
  surahName: string;
  surahAyahCount: number;
  segments: SurahSegment[];
  totalSegments: number;
  completedSegments: number;
  progressPercentage: number;
  averageMark: number;
  status: "not_started" | "in_progress" | "completed";
}

export interface StudentGroupedSectionsResponse {
  student: {
    id: string;
    group: string;
    groupId: string;
  };
  surahs: GroupedSurah[];
  summary: {
    totalSurahs: number;
    completedSurahs: number;
    inProgressSurahs: number;
    notStartedSurahs: number;
    totalSegments: number;
    completedSegments: number;
    progressPercent: number; // ✅ نسبة التقدم = (السور المكتملة / السور الكلية) * 100
  };
}

// ============================================================================
// Time Filter Types
// ============================================================================

export type TimeFilterType = "all" | "month" | "week" | "custom";

export interface TimeFilterParams {
  timeFilter?: TimeFilterType;
  dateFrom?: string; // YYYY-MM-DD format
  dateTo?: string; // YYYY-MM-DD format
}

/**
 * Get student sections grouped by Surah
 * @param studentId - Student ID
 * @param groupId - Optional group ID for filtering
 * @param timeFilterParams - Optional time filter parameters
 */
export const getStudentSectionsGrouped = async (
  studentId: string,
  groupId?: string,
  timeFilterParams?: TimeFilterParams,
): Promise<{
  success: boolean;
  data?: StudentGroupedSectionsResponse;
  message?: string;
  error?: string;
}> => {
  try {
    console.log("📡 [API] getStudentSectionsGrouped called");
    console.log("📡 [API] studentId:", studentId);
    console.log("📡 [API] groupId:", groupId);
    console.log("📡 [API] timeFilterParams:", timeFilterParams);

    const params: Record<string, string> = {};
    if (groupId) {
      params.groupId = groupId;
    }

    // إضافة فلتر الفترة الزمنية
    if (timeFilterParams?.timeFilter && timeFilterParams.timeFilter !== "all") {
      params.timeFilter = timeFilterParams.timeFilter;

      if (timeFilterParams.timeFilter === "custom") {
        if (timeFilterParams.dateFrom)
          params.dateFrom = timeFilterParams.dateFrom;
        if (timeFilterParams.dateTo) params.dateTo = timeFilterParams.dateTo;
      }
    }

    const url = `/daily-marks/student/${studentId}/grouped-sections`;
    console.log("📡 [API] Request URL:", url, "params:", params);

    const response = await api.get(url, { params });
    console.log("📡 [API] Raw response:", response);
    console.log("📡 [API] Response data:", response.data);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error("❌ [API] Error fetching grouped sections:", error);
    console.error("❌ [API] Error response:", error.response?.data);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "حدث خطأ في جلب المقاطع",
    };
  }
};
