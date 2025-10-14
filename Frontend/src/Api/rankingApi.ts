// Ranking API functions
import api from "./api";

export interface RankingStudent {
  studentId: {
    _id: string;
    firstName: string;
    fatherName: string;
    lastName: string;
    group: string;
  };
  score: number;
  rank?: number;
}

export interface Ranking {
  _id: string;
  month: number;
  year: number;
  group: string;
  topThree: RankingStudent[];
  topTen: RankingStudent[];
}

export interface Period {
  month: number;
  year: number;
  label?: string;
}

export interface NewRankingData {
  month: number;
  year: number;
  topThree: Array<{ studentId: string; score: number }>;
  topTen: Array<{ studentId: string; score: number }>;
}

export interface StudentWithAverage {
  _id: string;
  studentId: number;
  firstName: string;
  fatherName: string;
  lastName: string;
  group: string;
  overallAverage: number;
  reviewAverage: number;
  memorizationAverage: number;
  totalMarks: number;
  rank: number;
}

export interface RankingByAveragesResponse {
  success: boolean;
  data: StudentWithAverage[];
  month: number;
  year: number;
  group: string;
  totalStudents: number;
}

// Get all available periods
export const getAvailablePeriods = async (): Promise<Period[]> => {
  try {
    const response = await api.get("/rankings/periods");
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching periods:", error);
    throw error;
  }
};

// Get current ranking
export const getCurrentRanking = async (
  group?: string
): Promise<Ranking | null> => {
  try {
    // Only include group param if it's a non-empty string
    const params = group && group.trim() ? { group } : {};
    const response = await api.get("/rankings/current", { params });
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error: unknown) {
    // Don't log 404 errors - they just mean no current ranking exists
    const axiosError = error as { response?: { status?: number } };
    if (axiosError?.response?.status !== 404) {
      console.error("Error fetching current ranking:", error);
    }
    throw error;
  }
};

// Get ranking by period
export const getRankingByPeriod = async (
  month: number,
  year: number,
  group?: string
): Promise<Ranking | null> => {
  try {
    // Only include group param if it's a non-empty string
    const params = group && group.trim() ? { group } : {};
    const response = await api.get(`/rankings/period/${year}/${month}`, {
      params,
    });
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error: unknown) {
    // Don't log 404 errors - they just mean no ranking exists for this period
    const axiosError = error as { response?: { status?: number } };
    if (axiosError?.response?.status !== 404) {
      console.error("Error fetching ranking by period:", error);
    }
    throw error;
  }
};

// Create or update ranking
export const createRanking = async (
  rankingData: NewRankingData
): Promise<Ranking> => {
  try {
    const response = await api.post("/rankings", rankingData);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to create ranking");
  } catch (error: unknown) {
    const axiosError = error as {
      response?: {
        status?: number;
        data?: { message?: string };
      };
    };

    // Log detailed error for debugging
    console.error("Error creating/updating ranking:", {
      status: axiosError?.response?.status,
      message: axiosError?.response?.data?.message,
      data: rankingData,
    });

    throw error;
  }
};

// Update ranking
export const updateRanking = async (
  id: string,
  rankingData: Partial<NewRankingData>
): Promise<Ranking> => {
  try {
    const response = await api.put(`/rankings/${id}`, rankingData);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to update ranking");
  } catch (error) {
    console.error("Error updating ranking:", error);
    throw error;
  }
};

// Delete ranking
export const deleteRanking = async (id: string): Promise<void> => {
  try {
    const response = await api.delete(`/rankings/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete ranking");
    }
  } catch (error) {
    console.error("Error deleting ranking:", error);
    throw error;
  }
};

// Get ranking by monthly averages (NEW)
export const getRankingByAverages = async (
  month?: number,
  year?: number,
  group?: string
): Promise<RankingByAveragesResponse> => {
  try {
    const params: Record<string, string | number> = {};
    if (month) params.month = month;
    if (year) params.year = year;
    if (group) params.group = group;

    const response = await api.get("/rankings/by-averages", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching ranking by averages:", error);
    throw error;
  }
};
