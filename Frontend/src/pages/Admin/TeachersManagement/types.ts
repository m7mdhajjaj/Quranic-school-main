import type { Teacher as ApiTeacher } from "@/Api/teacherApi";

// Re-export Teacher type from API
export type Teacher = ApiTeacher;

export type SortField = "teacherId" | "firstName" | "age" | "email";
export type SortOrder = "asc" | "desc";
export type ViewMode = "table" | "grid";
export type GroupsFilter = "all" | "withGroups" | "withoutGroups";

export interface TeacherStats {
  total: number;
  male: number;
  female: number;
  active: number;
  inactive: number;
  withGroups: number;
  withoutGroups: number;
  avgAge: string | number;
}

export interface ApiStats {
  totalTeachers: number;
  activeTeachers: number;
  maleTeachers: number;
  femaleTeachers: number;
  withGroups: number;
  withoutGroups: number;
}
