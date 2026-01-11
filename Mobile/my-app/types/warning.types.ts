export interface Warning {
  _id: string;
  student: string | Student;
  teacher: string;
  groupName: string;
  type: "warning" | "first" | "second" | "third";
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export type WarningType = "warning" | "first" | "second" | "third";

export interface Student {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  username?: string;
  group?: {
    _id: string;
    name: string;
  };
}

export interface StudentWithWarnings extends Student {
  warnings: {
    warning: number;
    first: number;
    second: number;
    third: number;
    total: number;
    details: Warning[];
  };
}

export interface GroupWithWarnings {
  _id: string;
  name: string;
  students: StudentWithWarnings[];
  expelledStudents: Student[];
  statistics: {
    totalWarnings: number;
    warning: number;
    first: number;
    second: number;
    third: number;
    studentsWithWarnings: number;
    expelledCount: number;
  };
}

export interface TeacherStatistics {
  totalWarnings: number;
  warningsByType: {
    warning: number;
    first: number;
    second: number;
    third: number;
  };
  studentsWithWarnings: number;
  expelledStudents: number;
  groupsWithWarnings: number;
}

export interface CreateWarningData {
  studentId: string;
  teacherId: string;
  groupName: string;
  type: WarningType;
  reason: string;
}
