/**
 * Types for Ranking Screen
 */

export interface StudentWithAverage {
  _id: string;
  firstName: string;
  fatherName: string;
  lastName: string;
  rank: number;
  overallAverage: number;
  memorizationAverage: number;
  reviewAverage: number;
  totalMarks: number;
  group?: string;
}

export interface Group {
  id: string;
  name: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  role: "student" | "teacher" | "admin";
  group?: string;
  groups?: Group[];
}

// Component Props
export interface FilterPanelProps {
  selectedYear: number;
  selectedMonth: number;
  selectedGroup: string;
  availableYears: number[];
  user: User | null;
  teacherGroups: string[] | null;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onGroupChange: (group: string) => void;
}

export interface PodiumProps {
  topThreeStudents: StudentWithAverage[];
}

export interface RankingListProps {
  students: StudentWithAverage[];
}

export interface UseRankingDataReturn {
  students: StudentWithAverage[];
  teacherGroups: string[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface EmptyStateProps {
  selectedMonth: number;
  selectedYear: number;
}

export interface HeaderProps {
  selectedMonth: number;
  selectedYear: number;
  studentsCount: number;
}
