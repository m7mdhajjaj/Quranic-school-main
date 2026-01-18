// Re-export types from API for consistency
import type { Mark as ApiMark, Section as ApiSection } from "@/Api/DailyMark/dailyMarksApi";
import type { QuranSegmentData, QuranSegmentUI as ValidationQuranSegmentUI } from '@/Validation/DailyMark';

// Re-export QuranSegmentUI from Validation (single source of truth)
export type QuranSegmentUI = ValidationQuranSegmentUI;

// Re-export QuranSegmentData for convenience
export type { QuranSegmentData } from '@/Validation/DailyMark';

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

// SectionsTable Component Props
export interface SectionsTableProps {
  sections: Section[];
  marks: Mark[];
  loadingMarks: boolean;
  isTeacher: boolean;
  selectedGroup: string;
  studentId?: string | null; // Filter marks by student to prevent cross-student display
  onAddMark?: (section: Section) => void;
  onUpdateMark?: (mark: Mark, section: Section) => void;
  onEditSection?: (section: Section) => void;
  onDeleteSection?: (sectionId: string) => void;
  onBulkMarks?: (section: Section) => void;
  // Navigation props for month/year
  selectedMonth?: number;
  selectedYear?: number;
  onMonthChange?: (month: number) => void;
  onYearChange?: (year: number) => void;
  onPreviousMonth?: () => void;
  onCurrentMonth?: () => void;
  onNextMonth?: () => void;
}

// MonthYearFilter Component Props
export interface MonthYearFilterProps {
  selectedMonth: number | null;
  selectedYear: number | null;
  selectedDay?: number | null;
  onMonthChange: (month: number | null) => void;
  onYearChange: (year: number | null) => void;
  onDayChange?: (day: number | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  startDate?: string | null;
  endDate?: string | null;
  onStartDateChange?: (date: string | null) => void;
  onEndDateChange?: (date: string | null) => void;
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
  onSubmit: (e: React.FormEvent, data?: Omit<Section, "_id">) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

// EditSectionModal Props
export interface EditSectionModalProps {
  isOpen: boolean;
  editingSection: Section | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent, data?: Partial<Section>) => void;
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

// BulkMarksModal Props
export interface BulkMarksModalProps {
  isOpen: boolean;
  section: Section | null;
  group: string;
  onClose: () => void;
  onSuccess?: () => void;
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
  selectedGroup: string;
  teacherGroups: string[];
  sections: Section[];
  marks: Mark[];
  loadingMarks: boolean;
  onBulkMarks?: (section: Section) => void;
  onGroupSelect?: (group: string) => void;
  onAddSection?: () => void;
  onEditSection?: (section: Section) => void;
  onDeleteSection?: (sectionId: string) => void;
  onBulkDelete?: () => void;
  onAddMark?: (section: Section, student: Student) => void;
  onUpdateMark?: (mark: Mark, section: Section, student: Student) => void;
  onDeleteMark?: (markId: string) => void;
  onMarkChange?: () => void;
  onRefreshData?: () => void; // ✅ New prop for instant refresh
  // Filter props
  selectedMonth: number | null;
  selectedYear: number | null;
  selectedDay?: number | null;
  onMonthChange: (month: number | null) => void;
  onYearChange: (year: number | null) => void;
  onDayChange?: (day: number | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  startDate?: string | null;
  endDate?: string | null;
  onStartDateChange?: (date: string | null) => void;
  onEndDateChange?: (date: string | null) => void;
  selectedFilterMode?: 'week' | 'all';
  onFilterModeChange?: (mode: 'week' | 'all') => void;
}

// StudentView Props
export interface StudentViewProps {
  sections: Section[];
  marks: Mark[];
  loadingMarks: boolean;
  averages: AverageResults;
  selectedMonth: number;
  selectedYear: number;
  studentId?: string | null; // Student ID to filter marks (prevents cross-student display)
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  // Note: searchQuery and onSearchChange removed - filtering happens in background via useFilteredMarksData
}
