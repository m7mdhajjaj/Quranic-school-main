// ============================================================================
// Group Types - أنواع بيانات الحلقات
// ============================================================================

export interface Group {
  _id: string;
  name: string;
  number?: number;
  teacher: string;
  teacherName?: string;
  description?: string;
  capacity?: number;
  schedule?: string;
  activeStatus: boolean;
  currentStudents?: number;
  isFull?: boolean;
  availableSpots?: number;
  capacityStatus?: string;
  capacityPercentage?: number;
  timetable?: Array<{
    _id?: string;
    day: string;
    startHour: string;
    endHour: string;
  }>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface GroupFormData {
  name: string;
  teacher: string;
  description?: string;
  capacity?: number;
  schedule?: string;
  activeStatus?: boolean;
}

export interface GroupWithStudents extends Group {
  students?: Array<{
    _id: string;
    studentId: number;
    name: string;
  }>;
  totalStudents?: number;
  hasStudents?: boolean;
  isEmpty?: boolean;
}

export interface GroupsByTeacherResponse {
  teacher: {
    _id: string;
    name: string;
  };
  groups: GroupWithStudents[];
  summary: {
    totalGroups: number;
    groupsWithStudents: number;
    emptyGroups: number;
    totalStudents: number;
  };
}

export interface GroupsStats {
  totalGroups: number;
  totalStudents: number;
  fullGroups: number;
  emptyGroups: number;
  totalCapacity: number;
  availableSeats: number;
  occupancyRate?: number;
  activeGroups?: number;
  byTeacher?: Array<{
    teacher: string;
    groupsCount: number;
    studentsCount: number;
  }>;
}

export interface GroupsQueryParams {
  search?: string;
  capacity?: "all" | "small" | "medium" | "large";
  status?: "all" | "active" | "inactive";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
  showing: number;
}

export type GroupFilter = "all" | "withStudents" | "withoutStudents";
export type SortField = "name" | "teacher" | "capacity";
export type SortOrder = "asc" | "desc";
export type CapacityFilter = "all" | "small" | "medium" | "large";
export type StatusFilter = "all" | "active" | "inactive";
