import type { Student as ApiStudent } from "@/Api/studentApi";

// Re-export Student type from API
export type Student = ApiStudent;

export type SortField = "studentId" | "firstName" | "age" | "group";
export type SortOrder = "asc" | "desc";
export type ViewMode = "table" | "grid";
export type GroupsFilter = "all" | "withGroups" | "withoutGroups";

export interface StudentStats {
  total: number;
  male: number;
  female: number;
  active: number;
  inactive: number;
  avgAge: string | number;
}

export interface ApiStats {
  totalStudents: number;
  activeStudents: number;
  maleStudents: number;
  femaleStudents: number;
  byGroup: Array<{ group: string; count: number }>;
}
