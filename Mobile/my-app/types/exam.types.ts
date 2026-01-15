export interface Exam {
  _id: string;
  name: string;
  date: string;
  time?: string;
  type?: "تحريري" | "شفهي" | "تقييم شامل" | "كتابي"; // الباك إند يستخدم type
  examType?: "تحريري" | "شفهي" | "تقييم شامل" | "كتابي"; // للتوافق مع الكود القديم
  subject: string;
  duration?: number;
  totalMarks: number;
  passingMarks?: number;
  group?: string; // الباك إند يستخدم group (مفرد)
  groups?: string[]; // للتوافق مع الكود القديم
  createdBy?: string;
  teacher?: string;
  createdAt?: string;
  updatedAt?: string;
  marksEntered?: boolean;
  marks?: any[];
}

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

export interface Mark {
  _id: string;
  exam: string | Exam;
  student: string | Student;
  mark: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExamWithMarks extends Exam {
  averageMark?: number;
  totalStudents?: number;
}

export interface StudentExamResult {
  exam: Exam;
  mark?: Mark;
  status: "graded" | "pending" | "not-graded";
}

export interface ExamFilters {
  query: string;
  dateFilter: string;
  typeFilter: string;
  marksFilter: string;
}

export interface MarksFormData {
  studentId: string;
  mark: number;
}

export interface ExamFormData {
  name: string;
  date: string;
  time: string;
  examType: "تحريري" | "شفهي" | "تقييم شامل";
  subject: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  groups: string[];
}

// ======= Marks Management Types =======

export interface TeacherGroupStudent {
  _id: string;
  studentId: string;
  name: string;
  firstName: string;
  lastName: string;
}

export interface TeacherGroup {
  _id: string;
  name: string;
  capacity?: number;
  description?: string;
  students: TeacherGroupStudent[];
  totalStudents: number;
  examCount: number;
  hasStudents: boolean;
}

export interface TeacherGroupsData {
  teacher: {
    _id: string;
    name: string;
  };
  groups: TeacherGroup[];
  summary: {
    totalGroups: number;
    totalStudents: number;
  };
}

export interface TeacherGroupsResponse {
  success: boolean;
  data: TeacherGroupsData;
}

export interface MarkWithStudent {
  _id: string;
  studentId: string;
  studentName: string;
  mark: number;
  examId: string;
}
