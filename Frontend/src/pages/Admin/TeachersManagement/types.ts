import type { Teacher as ApiTeacher } from "@/Api/teacherApi";

// Re-export Teacher type from API
export type Teacher = ApiTeacher;

export type SortField = "teacherId" | "firstName" | "age" | "email";
export type SortOrder = "asc" | "desc";
export type ViewMode = "table" | "grid";
export type GroupsFilter = "all" | "withGroups" | "withoutGroups";

export interface TeacherFiltersParams {
  gender?: string;
  minAge?: number;
  maxAge?: number;
  group?: GroupsFilter | string;
  search?: string;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface TeacherStats {
  total: number;
  male: number;
  female: number;
  withGroups: number;
  withoutGroups: number;
  avgAge: string | number;
}

export interface ApiStats {
  total: number;
  male: number;
  female: number;
  withGroups: number;
  withoutGroups: number;
  avgAge: string | number;
}
