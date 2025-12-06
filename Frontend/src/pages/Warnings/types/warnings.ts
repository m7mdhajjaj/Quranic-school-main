// ============================================================================
// Types & Interfaces للإنذارات
// ============================================================================

export type WarningType =
  | "warning"
  | "first"
  | "second"
  | "third"
  | "expulsion";

export interface Warning {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  teacherId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  groupId: {
    _id: string;
    name: string;
  };
  type: WarningType;
  reason: string;
  date: string;
  createdAt: string;
}

export interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  isActive?: boolean; // حالة الطالب (أونلاين/أوفلاين)
  avatar?: {
    url?: string;
    publicId?: string;
  };
  warningsCount?: number; // إجمالي كل الإنذارات
  warningsOnlyCount?: number; // عدد التنبيهات فقط
  existingWarningTypes?: string[];
  allWarnings?: Warning[];
}

export interface Group {
  _id: string;
  name: string;
  students: Student[];
}

export interface TeacherStatistics {
  totalWarnings: number;
  warningsCount: {
    warning: number;
    first: number;
    second: number;
    third: number;
    expulsion: number;
  };
  studentsWithWarnings: number;
  expelledStudents: number;
  topReasons: Array<{ _id: string; count: number }>;
  warningsByGroup: Array<{ _id: string; count: number }>;
  recentWarnings: Warning[];
}

// Props للـ Components
export interface TeacherViewProps {
  groups: Group[];
  loading: boolean;
  loadingStudents?: boolean;
  selectedGroup?: Group | null;
  onGroupSelect: (group: Group) => void;
  onBack?: () => void;
  statistics: TeacherStatistics | null;
  loadingStatistics?: boolean;
  onGiveWarning?: (student: Student, type: WarningType) => void;
  onDeleteWarning?: (student: Student, type: string) => void;
  onDeleteWarningById?: (warningId: string, student: Student) => void;
}

export interface StudentViewProps {
  warnings: Warning[];
}

export interface GroupCardProps {
  group: Group;
  onClick: () => void;
}

export interface StudentCardProps {
  student: Student;
  onGiveWarning: (type: WarningType) => void;
  onDeleteWarning: (type: string) => void;
  onDeleteWarningById: (warningId: string) => void;
}

export interface WarningBadgeProps {
  type: WarningType;
  count?: number;
  onDelete?: () => void;
  showDelete?: boolean;
}

export interface StatisticsPanelProps {
  statistics: TeacherStatistics;
}

export interface GiveWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  warningType: WarningType;
  onConfirm: (reason: string) => void;
}

export interface DeleteWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  warningType: string;
  warningId?: string;
  onConfirm: () => void;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseWarningsDataReturn {
  user: any;
  groups: Group[];
  warnings: Warning[];
  loading: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  refetchData: () => void;
  fetchGroupStudentsWarnings: (group: Group) => Promise<Group>;
  setWarnings: React.Dispatch<React.SetStateAction<Warning[]>>;
}

export interface UseWarningsActionsReturn {
  statistics: TeacherStatistics | null;
  loadingStatistics: boolean;
  fetchTeacherStatistics: () => Promise<TeacherStatistics | null>;
  giveWarning: (
    student: Student,
    type: WarningType,
    reason: string,
    groupName: string,
    teacherId: string
  ) => Promise<boolean>;
  deleteWarning: (student: Student, warningType: string) => Promise<boolean>;
  deleteWarningById: (warningId: string) => Promise<boolean>;
}
