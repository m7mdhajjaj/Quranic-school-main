import type { Group as ApiGroup } from "@/Api/groupApi";

// Re-export Group type from API
export type Group = ApiGroup;

// Sort and Filter Types
export type SortField = "name" | "teacher" | "capacity";
export type SortOrder = "asc" | "desc";
export type ViewMode = "table" | "grid";

// Filter Types
export type TeacherFilter = string | "all";
export type CapacityFilter = "all" | "small" | "medium" | "large";
export type StatusFilter = "all" | "active" | "inactive";
export type OccupancyFilter =
  | "all"
  | "empty"
  | "low"
  | "medium"
  | "high"
  | "full";
export type DayFilter =
  | "all"
  | "السبت"
  | "الأحد"
  | "الإثنين"
  | "الثلاثاء"
  | "الأربعاء"
  | "الخميس"
  | "الجمعة";
export type TimeFilter = "all" | "morning" | "afternoon" | "evening";

// Statistics Interface
export interface GroupStats {
  totalGroups: number;
  totalStudents: number;
  fullGroups: number;
  emptyGroups: number;
  totalCapacity: number;
  availableSeats: number;
}
