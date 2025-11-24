// Re-export types from API for consistency
import type { Mark as ApiMark, Section as ApiSection } from "@/Api/dailyMarksApi";

// Use API types directly
export type Mark = ApiMark;
export type Section = ApiSection;

// Interface for Student data from backend
export interface Student {
  _id: string;
  studentId: number;
  firstName: string;
  fatherName: string;
  lastName: string;
  group: string;
  teacher: string;
}

// Interface for logged-in user
export interface LoggedInUser {
  _id: string;
  firstName: string;
  lastName?: string;
  fatherName?: string;
  group?: string;
  groups?: string[];
  role: string;
}

// ============================================
// Component Props Interfaces
// ============================================

// StudentList Component Props
export interface StudentListProps {
  students: Student[];
  teacherGroups: string[];
  selectedGroup: string;
  selectedStudentId: string | null;
  onGroupChange: (group: string) => void;
  onStudentSelect: (studentId: string) => void;
  onAddSection: () => void;
  onBulkUpdate: () => void;
  onBulkDelete: () => void;
}

// SectionsTable Component Props
export interface SectionsTableProps {
  sections: Section[];
  marks: Mark[];
  loadingMarks: boolean;
  isTeacher: boolean;
  onAddMark?: (section: Section) => void;
  onUpdateMark?: (mark: Mark, section: Section) => void;
  onEditSection?: (section: Section) => void;
  onDeleteSection?: (sectionId: string) => void;
}

// MonthYearFilter Component Props
export interface MonthYearFilterProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

// AveragesBar Component Props
export interface AveragesBarProps {
  reviewAverage: number;
  memorizationAverage: number;
  overallAverage: number;
  totalMarks: number;
}

// ============================================
// Hooks Return Types
// ============================================

// useSectionsFilter Hook Return Type
export interface AverageResults {
  reviewAverage: number;
  memorizationAverage: number;
  overallAverage: number;
  totalMarks: number;
}

// useDailyMarksData Hook Return Type
export interface UseDailyMarksDataResult {
  currentUser: LoggedInUser | null;
  students: Student[];
  sections: Section[];
  marks: Mark[];
  teacherGroups: string[];
  loading: boolean;
  loadingMarks: boolean;
  setMarks: React.Dispatch<React.SetStateAction<Mark[]>>;
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  refetchMarks: (studentId?: string) => Promise<void>;
  refetchSections: () => Promise<void>;
}

// ============================================
// Modal Props Interfaces
// ============================================

// AddSectionModal Props
export interface AddSectionModalProps {
  isOpen: boolean;
  selectedGroup: string;
  newSection: Omit<Section, "_id">;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

// EditSectionModal Props
export interface EditSectionModalProps {
  isOpen: boolean;
  editingSection: Section | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

// AddMarkModal Props
export interface AddMarkModalProps {
  isOpen: boolean;
  selectedSection: Section | null;
  selectedStudent: Student | null;
  newMark: {
    reviewMark: number;
    memorizationMark: number;
  };
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// UpdateMarkModal Props
export interface UpdateMarkModalProps {
  isOpen: boolean;
  selectedSection: Section | null;
  selectedStudent: Student | null;
  editingMark: Mark | null;
  newMark: {
    reviewMark: number;
    memorizationMark: number;
  };
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// BulkUpdateModal Props
export interface BulkUpdateModalProps {
  isOpen: boolean;
  sections: Section[];
  selectedSectionsForBulk: string[];
  isLoading?: boolean;
  onClose: () => void;
  onToggleSection: (sectionId: string) => void;
  onSubmit: (updateData: {
    reviewSection?: string;
    memorizationSection?: string;
  }) => void;
}

// BulkDeleteModal Props
export interface BulkDeleteModalProps {
  isOpen: boolean;
  sections: Section[];
  selectedSectionsForBulk: string[];
  isLoading?: boolean;
  onClose: () => void;
  onToggleSection: (sectionId: string) => void;
  onConfirm: () => void;
}

// ============================================
// View Props Interfaces
// ============================================

// TeacherView Props
export interface TeacherViewProps {
  students: Student[];
  selectedStudentId: string | null;
  sections: Section[];
  marks: Mark[];
  loadingMarks: boolean;
  onAddMark: (section: Section) => void;
  onUpdateMark: (mark: Mark, section: Section) => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (sectionId: string) => void;
}

// StudentView Props
export interface StudentViewProps {
  sections: Section[];
  marks: Mark[];
  loadingMarks: boolean;
  averages: AverageResults;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}
